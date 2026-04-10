create extension if not exists pgcrypto;

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  toss_user_key bigint not null unique,
  name text,
  email text,
  nickname text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  constraint members_nickname_length check (
    nickname is null or char_length(nickname) between 2 and 12
  )
);

alter table members enable row level security;

drop policy if exists "members_select_anon" on members;
create policy "members_select_anon"
on members
for select
to anon
using (true);

drop policy if exists "members_insert_anon" on members;
create policy "members_insert_anon"
on members
for insert
to anon
with check (true);

drop policy if exists "members_update_anon" on members;
create policy "members_update_anon"
on members
for update
to anon
using (true)
with check (true);

create index if not exists idx_members_toss_user_key on members (toss_user_key);
create index if not exists idx_members_nickname on members (nickname);
