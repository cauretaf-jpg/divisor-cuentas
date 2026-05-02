-- Cuenta Clara V8.1 - Amigos entre usuarios
-- Ejecutar en Supabase → SQL Editor → New query → Run

create table if not exists public.public_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nick text,
  nombre text,
  telefono text,
  avatar_data_url text,
  allow_search boolean default true,
  updated_at timestamptz default now()
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint friend_requests_not_self check (requester_id <> recipient_id),
  constraint friend_requests_unique_pair unique (requester_id, recipient_id)
);

alter table public.public_profiles enable row level security;
alter table public.friend_requests enable row level security;

drop policy if exists "public_profiles_select_authenticated" on public.public_profiles;
drop policy if exists "public_profiles_insert_own" on public.public_profiles;
drop policy if exists "public_profiles_update_own" on public.public_profiles;
drop policy if exists "public_profiles_delete_own" on public.public_profiles;

create policy "public_profiles_select_authenticated"
on public.public_profiles
for select
to authenticated
using (allow_search = true or auth.uid() = id);

create policy "public_profiles_insert_own"
on public.public_profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "public_profiles_update_own"
on public.public_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "public_profiles_delete_own"
on public.public_profiles
for delete
to authenticated
using (auth.uid() = id);

drop policy if exists "friend_requests_select_own" on public.friend_requests;
drop policy if exists "friend_requests_insert_own" on public.friend_requests;
drop policy if exists "friend_requests_update_own" on public.friend_requests;
drop policy if exists "friend_requests_delete_own" on public.friend_requests;

create policy "friend_requests_select_own"
on public.friend_requests
for select
to authenticated
using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "friend_requests_insert_own"
on public.friend_requests
for insert
to authenticated
with check (auth.uid() = requester_id and status = 'pending');

create policy "friend_requests_update_own"
on public.friend_requests
for update
to authenticated
using (auth.uid() = requester_id or auth.uid() = recipient_id)
with check (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "friend_requests_delete_own"
on public.friend_requests
for delete
to authenticated
using (auth.uid() = requester_id or auth.uid() = recipient_id);

create or replace function public.set_friend_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_friend_requests_updated_at on public.friend_requests;

create trigger set_friend_requests_updated_at
before update on public.friend_requests
for each row
execute function public.set_friend_requests_updated_at();
