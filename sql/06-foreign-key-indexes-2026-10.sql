-- Índices de claves foráneas detectadas por el analizador de Supabase.
-- No modifica datos ni tablas; evita búsquedas costosas al filtrar por FK.
-- Ejecutar solo en cuenta-clara-db (evmwuvjgokkxxnckhiyc).
CREATE INDEX IF NOT EXISTS idx_cc_cuentas_user_id ON public.cuentas (user_id);
CREATE INDEX IF NOT EXISTS idx_cc_friend_requests_recipient_id ON public.friend_requests (recipient_id);
CREATE INDEX IF NOT EXISTS idx_cc_participantes_persona_id ON public.participantes_producto (persona_id);
CREATE INDEX IF NOT EXISTS idx_cc_participantes_producto_id ON public.participantes_producto (producto_id);
CREATE INDEX IF NOT EXISTS idx_cc_personas_cuenta_id ON public.personas (cuenta_id);
CREATE INDEX IF NOT EXISTS idx_cc_productos_cuenta_id ON public.productos (cuenta_id);
CREATE INDEX IF NOT EXISTS idx_cc_shared_members_invited_by ON public.shared_account_members (invited_by);
