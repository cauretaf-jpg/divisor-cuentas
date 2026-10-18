-- Cuenta Clara: una invitación pendiente no concede lectura del JSON de la cuenta.
-- Se entrega exclusivamente el título de invitaciones propias mediante RPC controlada.
-- Esta función NO entrega account_state ni datos de participantes o consumo.
CREATE OR REPLACE FUNCTION public.can_access_shared_account(p_account_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $func$
  select exists (
    select 1 from public.shared_accounts a
    where a.id = p_account_id and a.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.shared_account_members m
    where m.account_id = p_account_id
      and m.user_id = auth.uid()
      and m.status = 'accepted'
  );
$func$;

REVOKE EXECUTE ON FUNCTION public.can_access_shared_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_shared_account(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_my_pending_shared_invites()
RETURNS TABLE(account_id uuid, title text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $func$
  select m.account_id, a.title
  from public.shared_account_members m
  join public.shared_accounts a on a.id = m.account_id
  where m.user_id = auth.uid()
    and m.status = 'pending'
  order by m.created_at desc;
$func$;

REVOKE EXECUTE ON FUNCTION public.list_my_pending_shared_invites() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_my_pending_shared_invites() TO authenticated;
