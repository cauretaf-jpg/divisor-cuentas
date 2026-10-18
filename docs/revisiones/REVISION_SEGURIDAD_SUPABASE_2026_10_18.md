# Cuenta Clara — Seguridad y persistencia Supabase (18-10-2026)

**Proyecto verificado:** `cuenta-clara-db` (`evmwuvjgokkxxnckhiyc`), organización `Cuenta Clara`. Se utilizó exclusivamente esta conexión; no se modificó Party Challenge ni ningún otro proyecto. 

## Revisión inicial
- 10 tablas `public`, las 10 con RLS activado.
- 17 funciones públicas, incluyendo las RPC de colaboración y los triggers de perfiles.
- Las funciones tenían permiso de ejecución por `PUBLIC` y `anon`.
- 5 funciones de actualización carecían de `search_path` fijo.
- 7 claves foráneas sin índice complementario.
- 35 políticas RLS usaban `auth.uid()` directamente en vez de `(select auth.uid())`.
- Las nuevas opciones del asistente (categorías, propinas, cantidades y `receiptExpectedSubtotal`) están serializadas en `public.app_states.state` (JSONB). No se requiere nueva tabla para ellas.

## Migraciones aplicadas a la base activa
1. **20261018154409** — `cuenta_clara_harden_function_execution_20261018`: `sql/05-security-hardening-2026-10.sql`. Revoca ejecución anónima y pública de funciones; concede a `authenticated` solamente las 9 RPC autorizadas; fija las rutas SQL.
2. **20261018154502** — `cuenta_clara_fk_indexes_20261018`: `sql/06-foreign-key-indexes-2026-10.sql`. Añade 7 índices faltantes.
3. **20261018154634** — `cuenta_clara_optimize_rls_auth_20261018`: `sql/07-optimize-rls-auth-2026-10.sql`. Cambia 35 políticas, conservando su condición de acceso, para que Supabase evalúe la identidad una vez por consulta. Reversión documentada en `sql/07-optimize-rls-auth-rollback.sql`.
4. **cuenta_clara_private_pending_invitations_20261018** — `sql/08-pending-invite-privacy-2026-10.sql`: restringe el JSON de cuentas compartidas a propietario o miembro que aceptó; añade `list_my_pending_shared_invites()`, una función solo para usuarios autenticados que devuelve únicamente `account_id` y `title` de invitaciones pendientes propias.

Se conservaron los datos y los mecanismos de autenticación. No se ejecutaron operaciones de borrado o modificación masiva de filas. Las migraciones usan cambios de privilegios, funciones, índices y políticas.

## Validaciones posteriores
- Todas las funciones de `public` anteriores a la última migración quedaron sin ejecución para `anon`.
- Las nueve RPC originales siguen disponibles para `authenticated`; la nueva RPC de títulos también.
- Las funciones y triggers tienen rutas SQL definidas.
- El analizador de Supabase ya no informa `function_search_path_mutable`, `anon_security_definer_function_executable`, `unindexed_foreign_keys` ni `auth_rls_initplan`.
- Las tablas siguen con RLS habilitado.
- La app en rama de desarrollo consulta títulos mediante la RPC limitada y solo carga `account_state` de membresías aceptadas.
- Se incluyeron verificaciones automáticas de sintaxis, cálculos y aserciones del nuevo flujo de invitaciones.

## Advertencias residuales
- `authenticated_security_definer_function_executable` se mantiene sobre funciones privilegiadas requeridas para las operaciones legítimas de colaboración. No conviene eliminar la ejecución autenticada indiscriminadamente: están protegidas por `auth.uid()` y por controles de dueño/rol; la nueva función de títulos solo devuelve invitaciones propias.
- `auth_leaked_password_protection`: activar protección de contraseñas filtradas desde **Supabase Dashboard → Authentication → Settings / Security** según disponibilidad del plan. Este ajuste no se hace por SQL.
- `unused_index`: métricas de uso todavía no disponibles o índices recién creados; no borrar índices sin historial representativo de consultas.

## Pruebas aún necesarias antes de integrar a producción
1. Dos cuentas de prueba reales, confirmar registro/inicio de sesión y sincronización de `app_states` (incluido crear, volver y guardar borrador).
2. Invitar: la persona ve título, no datos privados; al aceptar puede ver contenido y, según rol, editar o no.
3. Rechazar invitación, cambiar rol, quitar miembro y recargar desde otro dispositivo.
4. Crear cuenta móvil y escritorio, añadir productos/cantidades, comparar boleta, propina, exenciones, cálculos, historial y pagos.
5. Verificar funcionalidad de PWA y caché tras actualización.
6. Pruebas de accesibilidad y diseño final conforme a PDF.

**No confundir migraciones SQL exitosas con pruebas E2E de usuario.** La rama `feature/asistente-contextual-propinas-2026-10` no se ha fusionado automáticamente con `main`. El sitio de producción continuará con UI anterior hasta revisión de integración. Evitar reejecutar manualmente scripts antiguos `sql/03-` que sobrescriban las definiciones nuevas.

## Referencias
- https://supabase.com/docs/guides/database/database-linter
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
