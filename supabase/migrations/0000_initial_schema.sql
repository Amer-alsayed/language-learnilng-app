-- -----------------------------------------------------------------------------
-- GERMAN MASTERY - CORE DATABASE SCHEMA (v1.1)
-- -----------------------------------------------------------------------------
-- Principals:
-- 1. Strict Typing: Enforce data integrity at the database level.
-- 2. Audit Trails: All tables track creation and modification times implicitly.
-- 3. Row Level Security: Security by design, not by obscurity.
-- -----------------------------------------------------------------------------

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "moddatetime"; -- Standard Supabase extension for auto-updates

-- -----------------------------------------------------------------------------
-- 1. UTILITIES & TRIGGERS
-- -----------------------------------------------------------------------------
-- We use pg_graphql for the API, so we want standard timestamps.

-- -----------------------------------------------------------------------------
-- 2. PUBLIC TABLES
-- -----------------------------------------------------------------------------

-- TABLE: PROFILES
-- Description: Extends standard Supabase Auth user.
create table profiles (
  id uuid references auth.users not null primary key, -- 1:1 Map to Auth User
  email text not null,
  role text default 'student' check (role in ('student', 'admin')),
  class_group text,
  xp integer default 0 check (xp >= 0),
  streak integer default 0 check (streak >= 0),
  
  -- Audit & Subscriptions
  last_active_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '2 months'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Trigger: Auto-update updated_at
create trigger handle_updated_at before update on profiles
  for each row execute procedure moddatetime (updated_at);

-- TABLE: UNITS
-- Description: The high-level groupings of the curriculum.
create table units (
  id uuid default uuid_generate_v4() primary key,
  order_index integer not null check (order_index >= 0),
  title text not null,
  description text,
  
  -- Audit
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Constraint: unique order to prevent collisions
  unique(order_index)
);

create trigger handle_updated_at before update on units
  for each row execute procedure moddatetime (updated_at);

-- TABLE: LESSONS
-- Description: The playable levels. Stores content as robust JSONB.
create table lessons (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references units(id) on delete cascade not null,
  order_index integer not null check (order_index >= 0),
  title text not null,
  
  -- The Core Content: We use JSONB for flexibility in exercise types.
  -- Validated strictly by Zod on the application layer.
  content jsonb not null default '{}'::jsonb,
  
  -- Audit
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Constraint: Lessons must be unique within a unit
  unique(unit_id, order_index)
);

create trigger handle_updated_at before update on lessons
  for each row execute procedure moddatetime (updated_at);

-- TABLE: USER_PROGRESS
-- Description: Tracks completion status. High-traffic table.
create table user_progress (
  user_id uuid references profiles(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  
  status text default 'locked' check (status in ('locked', 'active', 'completed')),
  stars integer default 0 check (stars between 0 and 3),
  
  -- timestamps
  completed_at timestamptz,
  updated_at timestamptz default now() not null,
  
  primary key (user_id, lesson_id)
);

create trigger handle_updated_at before update on user_progress
  for each row execute procedure moddatetime (updated_at);

-- -----------------------------------------------------------------------------
-- 3. INDEXES (PERFORMANCE TUNING)
-- -----------------------------------------------------------------------------
-- We anticipate high read volume on these specific queries.
create index idx_lessons_unit_id on lessons(unit_id);
create index idx_user_progress_user_id on user_progress(user_id);
create index idx_user_progress_lesson_id on user_progress(lesson_id);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- PROFILES
alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admins can view all profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- UNITS & LESSONS
-- Publicly readable by authenticated users.
alter table units enable row level security;
alter table lessons enable row level security;

create policy "Units are viewable by authed users" on units
  for select using (auth.role() = 'authenticated');

create policy "Lessons are viewable by authed users" on lessons
  for select using (auth.role() = 'authenticated');

-- Admin Write Access
create policy "Admins can manage units" on units
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage lessons" on lessons
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- USER PROGRESS
alter table user_progress enable row level security;

create policy "Users can view own progress" on user_progress
  for select using (auth.uid() = user_id);

-- Note: We intentionally DO NOT allow users to UPDATE/INSERT freely via the API.
-- Updates must happen via the trusted server function below to prevent score tampering.

-- -----------------------------------------------------------------------------
-- 5. SECURE SERVER FUNCTIONS (RPC)
-- -----------------------------------------------------------------------------

-- FUNCTION: complete_lesson
-- Purpose: Atomically updates progress and awards XP.
-- Security: SECURITY DEFINER (Runs with admin privileges, bypasses RLS).
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
  
  
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function complete_lesson(uuid, integer) from public;
grant execute on function complete_lesson(uuid, integer) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. AUTHENTICATION TRIGGERS
-- -----------------------------------------------------------------------------

-- FUNCTION: handle_new_user
-- Purpose: Automatically creates a profile row when a new user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger: on_auth_user_created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

