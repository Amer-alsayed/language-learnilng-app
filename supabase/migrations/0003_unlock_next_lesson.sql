-- -----------------------------------------------------------------------------
-- Add secure unlock progression (unlock next lesson on completion)
-- -----------------------------------------------------------------------------

create or replace function unlock_next_lesson(p_lesson_id uuid)
returns void as $$
declare
  v_user_id uuid;
  v_unit_id uuid;
  v_lesson_order integer;
  v_next_lesson_id uuid;
  v_unit_order integer;
  v_next_unit_id uuid;
  v_existing_status text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select unit_id, order_index
  into v_unit_id, v_lesson_order
  from lessons
  where id = p_lesson_id;

  if v_unit_id is null then
    return;
  end if;

  -- 1) Next lesson in the same unit
  select id
  into v_next_lesson_id
  from lessons
  where unit_id = v_unit_id
    and order_index > v_lesson_order
  order by order_index asc
  limit 1;

  -- 2) If none, first lesson of next unit
  if v_next_lesson_id is null then
    select order_index
    into v_unit_order
    from units
    where id = v_unit_id;

    if v_unit_order is null then
      return;
    end if;

    select id
    into v_next_unit_id
    from units
    where order_index > v_unit_order
    order by order_index asc
    limit 1;

    if v_next_unit_id is null then
      return;
    end if;

    select id
    into v_next_lesson_id
    from lessons
    where unit_id = v_next_unit_id
    order by order_index asc
    limit 1;
  end if;

  if v_next_lesson_id is null then
    return;
  end if;

  select status
  into v_existing_status
  from user_progress
  where user_id = v_user_id
    and lesson_id = v_next_lesson_id;

  if v_existing_status = 'completed' then
    return;
  end if;

  insert into user_progress (user_id, lesson_id, status, stars)
  values (v_user_id, v_next_lesson_id, 'active', 0)
  on conflict (user_id, lesson_id)
  do update set
    status = case
      when user_progress.status = 'locked' then 'active'
      else user_progress.status
    end;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function unlock_next_lesson(uuid) from public;
grant execute on function unlock_next_lesson(uuid) to authenticated, service_role;

-- Update completion RPC to unlock next lesson automatically (idempotent).
create or replace function complete_lesson(
  p_lesson_id uuid,
  p_stars_earned integer
)
returns void as $$
declare
  v_stars_earned integer;
  v_previous_stars integer;
  v_stars_delta integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Input Sanitization: Clamp stars between 0 and 3
  v_stars_earned := greatest(0, least(3, p_stars_earned));

  select stars
  into v_previous_stars
  from user_progress
  where user_id = auth.uid()
    and lesson_id = p_lesson_id;

  if v_previous_stars is null then
    v_previous_stars := 0;
  end if;

  -- 1. Upsert Progress
  insert into user_progress (user_id, lesson_id, status, stars, completed_at)
  values (auth.uid(), p_lesson_id, 'completed', v_stars_earned, now())
  on conflict (user_id, lesson_id)
  do update set
    status = 'completed',
    -- Only keep the high score
    stars = greatest(user_progress.stars, v_stars_earned),
    completed_at = now();

  -- 2. Award XP (Simple Logic: 10 XP per star)
  -- Only award incremental XP to prevent farming.
  v_stars_delta := greatest(v_stars_earned - v_previous_stars, 0);

  if v_stars_delta > 0 then
    update profiles
    set xp = xp + (v_stars_delta * 10),
        last_active_at = now()
    where id = auth.uid();
  else
    update profiles
    set last_active_at = now()
    where id = auth.uid();
  end if;

  -- 3. Unlock next lesson for this user
  perform unlock_next_lesson(p_lesson_id);
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function complete_lesson(uuid, integer) from public;
grant execute on function complete_lesson(uuid, integer) to authenticated, service_role;

