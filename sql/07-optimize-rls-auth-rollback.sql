-- REVERSIÓN DE LA OPTIMIZACIÓN DE RLS; las expresiones originales se recuperan literalmente.
ALTER POLICY "app_states_delete_own" ON public."app_states" USING ((auth.uid() = user_id));

ALTER POLICY "app_states_insert_own" ON public."app_states" WITH CHECK ((auth.uid() = user_id));

ALTER POLICY "app_states_select_own" ON public."app_states" USING ((auth.uid() = user_id));

ALTER POLICY "app_states_update_own" ON public."app_states" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

ALTER POLICY "cuentas_delete_own" ON public."cuentas" USING ((auth.uid() = user_id));

ALTER POLICY "cuentas_insert_own" ON public."cuentas" WITH CHECK ((auth.uid() = user_id));

ALTER POLICY "cuentas_select_own" ON public."cuentas" USING ((auth.uid() = user_id));

ALTER POLICY "cuentas_update_own" ON public."cuentas" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

ALTER POLICY "friend_requests_delete_own" ON public."friend_requests" USING (((auth.uid() = requester_id) OR (auth.uid() = recipient_id)));

ALTER POLICY "friend_requests_insert_own" ON public."friend_requests" WITH CHECK (((auth.uid() = requester_id) AND (status = 'pending'::text)));

ALTER POLICY "friend_requests_select_own" ON public."friend_requests" USING (((auth.uid() = requester_id) OR (auth.uid() = recipient_id)));

ALTER POLICY "friend_requests_update_own" ON public."friend_requests" USING (((auth.uid() = requester_id) OR (auth.uid() = recipient_id))) WITH CHECK (((auth.uid() = requester_id) OR (auth.uid() = recipient_id)));

ALTER POLICY "participantes_delete_own" ON public."participantes_producto" USING ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "participantes_insert_own" ON public."participantes_producto" WITH CHECK ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "participantes_select_own" ON public."participantes_producto" USING ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "participantes_update_own" ON public."participantes_producto" USING ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (productos
     JOIN cuentas ON ((cuentas.id = productos.cuenta_id)))
  WHERE ((productos.id = participantes_producto.producto_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "personas_delete_own" ON public."personas" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "personas_insert_own" ON public."personas" WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "personas_select_own" ON public."personas" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "personas_update_own" ON public."personas" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = personas.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "productos_delete_own" ON public."productos" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "productos_insert_own" ON public."productos" WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "productos_select_own" ON public."productos" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "productos_update_own" ON public."productos" USING ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM cuentas
  WHERE ((cuentas.id = productos.cuenta_id) AND (cuentas.user_id = auth.uid())))));

ALTER POLICY "profiles_insert_own" ON public."profiles" WITH CHECK ((auth.uid() = id));

ALTER POLICY "profiles_select_own" ON public."profiles" USING ((auth.uid() = id));

ALTER POLICY "profiles_update_own" ON public."profiles" USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));

ALTER POLICY "public_profiles_delete_own" ON public."public_profiles" USING ((auth.uid() = id));

ALTER POLICY "public_profiles_insert_own" ON public."public_profiles" WITH CHECK ((auth.uid() = id));

ALTER POLICY "public_profiles_select_authenticated" ON public."public_profiles" USING (((allow_search = true) OR (auth.uid() = id)));

ALTER POLICY "public_profiles_update_own" ON public."public_profiles" USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));

ALTER POLICY "shared_account_members_delete_access" ON public."shared_account_members" USING (((auth.uid() = user_id) OR is_shared_account_owner(account_id)));

ALTER POLICY "shared_account_members_select_access" ON public."shared_account_members" USING (((auth.uid() = user_id) OR is_shared_account_owner(account_id)));

ALTER POLICY "shared_accounts_delete_owner" ON public."shared_accounts" USING ((auth.uid() = owner_id));

ALTER POLICY "shared_accounts_insert_owner" ON public."shared_accounts" WITH CHECK ((auth.uid() = owner_id));
