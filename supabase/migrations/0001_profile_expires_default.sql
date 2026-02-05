alter table profiles
  alter column expires_at set default (now() + interval '2 months');

update profiles
set expires_at = now() + interval '2 months'
where expires_at is null;
