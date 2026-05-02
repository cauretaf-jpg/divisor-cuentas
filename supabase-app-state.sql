-- Cuenta Clara V7.0 - Estado completo por usuario
-- Ejecutar en Supabase → SQL Editor → New query → Run

create table if not exists public.app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.app_states enable row level security;

drop policy if exists "app_states_select_own" on public.app_states;
drop policy if exists "app_states_insert_own" on public.app_states;
drop policy if exists "app_states_update_own" on public.app_states;
drop policy if exists "app_states_delete_own" on public.app_states;

create policy "app_states_select_own"
on public.app_states
for select
to authenticated
using (auth.uid() = user_id);

create policy "app_states_insert_own"
on public.app_states
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "app_states_update_own"
on public.app_states
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "app_states_delete_own"
on public.app_states
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_app_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_app_states_updated_at on public.app_states;

create trigger set_app_states_updated_at
before update on public.app_states
for each row
execute function public.set_app_states_updated_at();
