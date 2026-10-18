-- Optimización del plan RLS sin alterar condiciones de acceso.
-- Solo cambia auth.uid() por (SELECT auth.uid()), una vez por instrucción.
-- Verificar las 35 políticas tras aplicar. Exclusivo para cuenta-clara-db.

ALTER POLICY "app_states_delete_own" ON public."app_states" USING (((select auth.uid()) = user_id));

ALTER POLICY "app_states_insert_own" ON public."app_states" WITH CHECK (((select auth.uid()) = user_id));

ALTER POLICY "app_states_select_own" ON public."app_states" USING (((select auth.uid()) = user_id));

ALTER POLICY "app_states_update_own" ON public."app_states" USING (((select auth.uid()) = user_id)) WITH CHECK (((select auth.uid()) = user_id));

ALTER POLICY "cuentas_delete_own" ON public."cuentas" USING (((select auth.uid()) = user_id));

ALTER POLICY "cuentas_insert_own" ON public."cuentas" WITH CHECK (((select auth.uid()) = user_id));

ALTER POLICY "cuentas_select_own" ON public."cuentas" USING (((select auth.uid()) = user_id));

ALTER POLICY "cuentas_update_own" ON public."cuentas" USING (((select auth.uid()) = user_id)) WITH CHECK (((select auth.uid()) = user_id));

ALTER POLICY "friend_requests_delete_own" ON public."friend_requests" USING ((((select auth.uid()) = requester_id) OR ((select auth.uid()) = recipient_id)));

ALTER POLICY "friend_requests_insert_own" ON public."friend_requests" WITH CHECK ((((select auth.uid()) = requester_id) AND (status = 'pending'::text)));

ALTER POLICY "friend_requests_select_own" ON public."friend_requests" USING ((((select auth.uid()) = requester_id) OR ((select auth.uid()) = recipient_id)));

ALTER POLICY "friend_requests_update_own" ON public."friend_requests" USING ((((select auth.uid()) = requester_id) OR ((select auth.uid()) = recipient_id))) WITH CHECK ((((select auth.uid()) = requester_id) OR ((select auth.uid()) = recipient_id)));

ALTER POLICY "participantes_delete_own" ON public."participantes_producto" USING ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "participantes_insert_own" ON public."participantes_producto" WITH CHECK ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "participantes_select_own" ON public."participantes_producto" USING ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "participantes_update_own" ON public."participantes_producto" USING ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = (select auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "personas_delete_own" ON public."personas" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "personas_insert_own" ON public."personas" WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "personas_select_own" ON public."personas" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "personas_update_own" ON public."personas" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = (select auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "productos_delete_own" ON public."productos" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "productos_insert_own" ON public."productos" WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "productos_select_own" ON public."productos" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "productos_update_own" ON public."productos" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = (select auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = (select auth.uid()))))));

ALTER POLICY "profiles_insert_own" ON public."profiles" WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "profiles_select_own" ON public."profiles" USING (((select auth.uid()) = id));

ALTER POLICY "profiles_update_own" ON public."profiles" USING (((select auth.uid()) = id)) WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "public_profiles_delete_own" ON public."public_profiles" USING (((select auth.uid()) = id));

ALTER POLICY "public_profiles_insert_own" ON public."public_profiles" WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "public_profiles_select_authenticated" ON public."public_profiles" USING (((allow_search = true) OR ((select auth.uid()) = id)));

ALTER POLICY "public_profiles_update_own" ON public."public_profiles" USING (((select auth.uid()) = id)) WITH CHECK (((select auth.uid()) = id));

ALTER POLICY "shared_account_members_delete_access" ON public."shared_account_members" USING ((((select auth.uid()) = user_id) OR is_shared_account_owner(account_id)));

ALTER POLICY "shared_account_members_select_access" ON public."shared_account_members" USING ((((select auth.uid()) = user_id) OR is_shared_account_owner(account_id)));

ALTER POLICY "shared_accounts_delete_owner" ON public."shared_accounts" USING (((select auth.uid()) = owner_id));

ALTER POLICY "shared_accounts_insert_owner" ON public."shared_accounts" WITH CHECK (((select auth.uid()) = owner_id));
