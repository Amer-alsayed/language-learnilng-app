alter table profiles
  add column if not exists class_group text;

create index if not exists idx_profiles_class_group on profiles(class_group);
