-- Cuenta Clara V13.17 - Suscripciones para notificaciones push
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Requerido solo si quieres notificaciones reales del celular con la app cerrada.

create extension if not exists pgcrypto;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  subscription jsonb not null,
  device_label text,
  enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  constraint push_subscriptions_user_endpoint_unique unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);
create index if not exists push_subscriptions_enabled_idx on public.push_subscriptions(enabled);

alter table public.push_subscriptions enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;

create policy "push_subscriptions_select_own"
on public.push_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
on public.push_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "push_subscriptions_update_own"
on public.push_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
on public.push_subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_push_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.set_push_subscriptions_updated_at();
