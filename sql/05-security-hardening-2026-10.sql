-- Cuenta Clara · migración de seguridad 2026-10-18
-- Destino exclusivo: Supabase cuenta-clara-db (evmwuvjgokkxxnckhiyc).
-- No altera ni elimina cuentas, sesiones, invitaciones ni filas existentes.
-- RLS permanece activo. Las RPC de colaboración siguen autorizadas a authenticated.
-- Evidencia preflight: 17 funciones public; 10 tablas public con RLS.
--
-- Quitar ejecución implícita desde PUBLIC, anon y authenticated.
-- Luego conceder únicamente las nueve RPC necesarias a authenticated.
-- No se revocan permisos de postgres ni de service_role.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.can_access_shared_account(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_shared_account(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_shared_account_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_shared_account_safe(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_shared_account_safe(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_shared_invite_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_shared_invite_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_shared_member_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_shared_member_role_safe(uuid, text) TO authenticated;

-- Fijar search_path de funciones SECURITY DEFINER y triggers de actualización
-- para prevenir referencias dinámicas al search_path de quien invoque.
ALTER FUNCTION public.can_access_shared_account(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.can_edit_shared_account(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.is_shared_account_owner(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.create_shared_account_safe(text, jsonb) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.update_shared_account_safe(uuid, text, jsonb) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.accept_shared_invite_safe(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.reject_shared_invite_safe(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.remove_shared_member_safe(uuid) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_shared_member_role_safe(uuid, text) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.handle_new_public_profile() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_app_states_updated_at() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_friend_requests_updated_at() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_public_profiles_updated_at() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_shared_accounts_updated_at() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_shared_account_members_updated_at() SET search_path = pg_catalog, public, pg_temp;

-- Tras aplicar, comprobar con has_function_privilege('anon', oid, 'EXECUTE')
-- y has_function_privilege('authenticated', oid, 'EXECUTE').
