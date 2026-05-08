# Cuenta Clara V12.1

Versión enfocada en pulir **cuentas compartidas, invitaciones y roles**.

## Nuevo en V12.1

- Panel de **Compartidas** más claro.
- Mejor separación entre acciones del dueño y acciones del invitado.
- Los invitados ya no pueden usar controles reservados para el dueño.
- Invitaciones con textos diferenciados para rol **Editor** y rol **Lector**.
- Estados más visibles para miembros: **Pendiente**, **Aceptado** y **Rechazado**.
- Resumen de colaboración con invitaciones, cuentas creadas, cuentas compartidas y miembros activos.
- Búsqueda de invitado más segura: si aparecen varios usuarios, se solicita correo o nick exacto.
- Banner de **Solo lectura** más evidente para usuarios con rol Lector.
- Cache actualizada a `v12.1`.

## Base de datos

No se agregan tablas nuevas respecto de la v12.0.

Si ya ejecutaste:

```sql
sql/03-supabase-shared-accounts.sql
```

no necesitas repetirlo. Si no lo ejecutaste, hazlo antes de probar invitaciones reales.

## Prueba recomendada

1. Entra con el usuario dueño.
2. Abre una cuenta con personas y gastos.
3. Ve a **Compartidas**.
4. Comparte la cuenta e invita a otro usuario como **Editor**.
5. Entra con el usuario invitado, acepta la invitación y verifica que pueda editar.
6. Cambia ese usuario a **Lector** desde el dueño.
7. Reabre la cuenta con el invitado y verifica que aparezca como **Solo lectura**.
