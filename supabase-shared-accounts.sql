-- Cuenta Clara V9.0 - Cuentas compartidas e invitaciones
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Puedes ejecutarlo después de supabase-app-state.sql y supabase-social.sql.

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

alter table public.shared_accounts enable row level security;
alter table public.shared_account_members enable row level security;

drop policy if exists "shared_accounts_select_members" on public.shared_accounts;
drop policy if exists "shared_accounts_insert_owner" on public.shared_accounts;
drop policy if exists "shared_accounts_update_editors" on public.shared_accounts;
drop policy if exists "shared_accounts_delete_owner" on public.shared_accounts;

create policy "shared_accounts_select_members"
on public.shared_accounts
for select
to authenticated
using (
  auth.uid() = owner_id
  or exists (
    select 1
    from public.shared_account_members m
    where m.account_id = shared_accounts.id
      and m.user_id = auth.uid()
      and m.status in ('pending', 'accepted')
  )
);

create policy "shared_accounts_insert_owner"
on public.shared_accounts
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "shared_accounts_update_editors"
on public.shared_accounts
for update
to authenticated
using (
  auth.uid() = owner_id
  or exists (
    select 1
    from public.shared_account_members m
    where m.account_id = shared_accounts.id
      and m.user_id = auth.uid()
      and m.status = 'accepted'
      and m.role = 'editor'
  )
)
with check (
  auth.uid() = owner_id
  or exists (
    select 1
    from public.shared_account_members m
    where m.account_id = shared_accounts.id
      and m.user_id = auth.uid()
      and m.status = 'accepted'
      and m.role = 'editor'
  )
);

create policy "shared_accounts_delete_owner"
on public.shared_accounts
for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "shared_account_members_select_related" on public.shared_account_members;
drop policy if exists "shared_account_members_insert_owner" on public.shared_account_members;
drop policy if exists "shared_account_members_update_related" on public.shared_account_members;
drop policy if exists "shared_account_members_delete_related" on public.shared_account_members;

create policy "shared_account_members_select_related"
on public.shared_account_members
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.shared_accounts a
    where a.id = shared_account_members.account_id
      and a.owner_id = auth.uid()
  )
);

create policy "shared_account_members_insert_owner"
on public.shared_account_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shared_accounts a
    where a.id = shared_account_members.account_id
      and a.owner_id = auth.uid()
  )
);

create policy "shared_account_members_update_related"
on public.shared_account_members
for update
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.shared_accounts a
    where a.id = shared_account_members.account_id
      and a.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.shared_accounts a
    where a.id = shared_account_members.account_id
      and a.owner_id = auth.uid()
  )
);

create policy "shared_account_members_delete_related"
on public.shared_account_members
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.shared_accounts a
    where a.id = shared_account_members.account_id
      and a.owner_id = auth.uid()
  )
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

create index if not exists shared_accounts_owner_idx on public.shared_accounts(owner_id);
create index if not exists shared_account_members_user_idx on public.shared_account_members(user_id);
create index if not exists shared_account_members_account_idx on public.shared_account_members(account_id);
