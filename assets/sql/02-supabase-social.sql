-- Cuenta Clara V8.7 - Perfil público y amigos entre usuarios
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Puedes volver a ejecutarlo aunque ya existan tablas anteriores.

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

alter table public.public_profiles add column if not exists email text;
alter table public.public_profiles add column if not exists nick text;
alter table public.public_profiles add column if not exists nombre text;
alter table public.public_profiles add column if not exists telefono text;
alter table public.public_profiles add column if not exists avatar_data_url text;
alter table public.public_profiles add column if not exists allow_search boolean default true;
alter table public.public_profiles add column if not exists updated_at timestamptz default now();

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

create or replace function public.set_public_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_profiles_updated_at on public.public_profiles;

create trigger set_public_profiles_updated_at
before update on public.public_profiles
for each row
execute function public.set_public_profiles_updated_at();

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

create or replace function public.handle_new_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_profiles (id, email, nick, nombre, allow_search, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1), new.email),
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1), new.email),
    true,
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    nick = coalesce(public.public_profiles.nick, excluded.nick),
    nombre = coalesce(public.public_profiles.nombre, excluded.nombre),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_public_profile on auth.users;

create trigger on_auth_user_created_public_profile
after insert on auth.users
for each row
execute function public.handle_new_public_profile();

create index if not exists public_profiles_search_idx
on public.public_profiles using gin (
  to_tsvector('simple', coalesce(nick, '') || ' ' || coalesce(nombre, '') || ' ' || coalesce(email, ''))
);
