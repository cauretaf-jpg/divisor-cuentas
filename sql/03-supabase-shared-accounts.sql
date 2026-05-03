-- Cuenta Clara V9.2 - Cuentas compartidas e invitaciones
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Este script también corrige políticas RLS de versiones anteriores.

create extension if not exists pgcrypto;

create table if not exists public.shared_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Cuenta compartida',
  account_state jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.shared_account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.shared_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('viewer', 'editor')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint shared_account_members_unique unique (account_id, user_id)
);

create index if not exists shared_accounts_owner_idx on public.shared_accounts(owner_id);
create index if not exists shared_account_members_user_idx on public.shared_account_members(user_id);
create index if not exists shared_account_members_account_idx on public.shared_account_members(account_id);

alter table public.shared_accounts enable row level security;
alter table public.shared_account_members enable row level security;

-- Funciones auxiliares SECURITY DEFINER para evitar recursión/caché de relaciones en políticas RLS.
create or replace function public.is_shared_account_owner(p_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_accounts a
    where a.id = p_account_id
      and a.owner_id = auth.uid()
  );
$$;

create or replace function public.can_access_shared_account(p_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_accounts a
    where a.id = p_account_id
      and a.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.shared_account_members m
    where m.account_id = p_account_id
      and m.user_id = auth.uid()
      and m.status in ('pending', 'accepted')
  );
$$;

create or replace function public.can_edit_shared_account(p_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shared_accounts a
    where a.id = p_account_id
      and a.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.shared_account_members m
    where m.account_id = p_account_id
      and m.user_id = auth.uid()
      and m.status = 'accepted'
      and m.role = 'editor'
  );
$$;

grant execute on function public.is_shared_account_owner(uuid) to authenticated;
grant execute on function public.can_access_shared_account(uuid) to authenticated;
grant execute on function public.can_edit_shared_account(uuid) to authenticated;

drop policy if exists "shared_accounts_select_members" on public.shared_accounts;
drop policy if exists "shared_accounts_insert_owner" on public.shared_accounts;
drop policy if exists "shared_accounts_update_editors" on public.shared_accounts;
drop policy if exists "shared_accounts_delete_owner" on public.shared_accounts;

drop policy if exists "shared_accounts_select_access" on public.shared_accounts;
drop policy if exists "shared_accounts_update_access" on public.shared_accounts;

create policy "shared_accounts_select_access"
on public.shared_accounts
for select
to authenticated
using (public.can_access_shared_account(id));

create policy "shared_accounts_insert_owner"
on public.shared_accounts
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "shared_accounts_update_access"
on public.shared_accounts
for update
to authenticated
using (public.can_edit_shared_account(id))
with check (public.can_edit_shared_account(id));

create policy "shared_accounts_delete_owner"
on public.shared_accounts
for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "shared_account_members_select_related" on public.shared_account_members;
drop policy if exists "shared_account_members_insert_owner" on public.shared_account_members;
drop policy if exists "shared_account_members_update_related" on public.shared_account_members;
drop policy if exists "shared_account_members_delete_related" on public.shared_account_members;

drop policy if exists "shared_account_members_select_access" on public.shared_account_members;
drop policy if exists "shared_account_members_insert_owner_v91" on public.shared_account_members;
drop policy if exists "shared_account_members_update_access" on public.shared_account_members;
drop policy if exists "shared_account_members_delete_access" on public.shared_account_members;

create policy "shared_account_members_select_access"
on public.shared_account_members
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_shared_account_owner(account_id)
);

create policy "shared_account_members_insert_owner_v91"
on public.shared_account_members
for insert
to authenticated
with check (public.is_shared_account_owner(account_id));

create policy "shared_account_members_update_access"
on public.shared_account_members
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_shared_account_owner(account_id)
)
with check (
  auth.uid() = user_id
  or public.is_shared_account_owner(account_id)
);

create policy "shared_account_members_delete_access"
on public.shared_account_members
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_shared_account_owner(account_id)
);

create or replace function public.set_shared_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_shared_accounts_updated_at on public.shared_accounts;
create trigger set_shared_accounts_updated_at
before update on public.shared_accounts
for each row
execute function public.set_shared_accounts_updated_at();

create or replace function public.set_shared_account_members_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_shared_account_members_updated_at on public.shared_account_members;
create trigger set_shared_account_members_updated_at
before update on public.shared_account_members
for each row
execute function public.set_shared_account_members_updated_at();


-- Funciones seguras para crear/actualizar cuentas compartidas desde la app.
-- Evitan errores de INSERT por RLS porque owner_id se toma directamente desde auth.uid().
create or replace function public.create_shared_account_safe(
  p_title text,
  p_account_state jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para compartir una cuenta.';
  end if;

  insert into public.shared_accounts (owner_id, title, account_state, updated_at)
  values (
    v_user_id,
    coalesce(nullif(trim(p_title), ''), 'Cuenta compartida'),
    coalesce(p_account_state, '{}'::jsonb),
    now()
  )
  returning id into v_account_id;

  return v_account_id;
end;
$$;

create or replace function public.update_shared_account_safe(
  p_account_id uuid,
  p_title text,
  p_account_state jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_can_edit boolean;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para editar una cuenta compartida.';
  end if;

  select public.can_edit_shared_account(p_account_id) into v_can_edit;

  if not coalesce(v_can_edit, false) then
    raise exception 'No tienes permiso para editar esta cuenta compartida.';
  end if;

  update public.shared_accounts
  set
    title = coalesce(nullif(trim(p_title), ''), title),
    account_state = coalesce(p_account_state, account_state),
    updated_at = now()
  where id = p_account_id;

  return true;
end;
$$;

grant execute on function public.create_shared_account_safe(text, jsonb) to authenticated;
grant execute on function public.update_shared_account_safe(uuid, text, jsonb) to authenticated;

notify pgrst, 'reload schema';
