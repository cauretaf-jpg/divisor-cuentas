# Cuenta Clara V13.14

Versión enfocada en **solicitudes de cuentas compartidas entre amigos registrados** y vista móvil más compacta.

## Nuevo en V13.14

- Al agregar un amigo registrado desde Personas, la app puede enviarle una solicitud real de cuenta compartida.
- El amigo invitado puede aceptar o rechazar desde **Compartidas** o desde **Mi Perfil > Amigos**.
- Al aceptar, la cuenta queda visible como compartida y se guarda localmente vinculada para impactar el perfil financiero.
- La sección Compartidas muestra mejor participantes manuales, usuarios registrados, pendientes y aceptados.
- Se agregó botón **Enviar solicitud** para participantes registrados que aún no tienen invitación.
- Se agregaron bloques en Perfil:
  - Solicitudes de cuentas.
  - Cuentas compartidas aceptadas.
- Vista móvil compacta para solicitudes, tarjetas, botones y listas de compartidas.

## Base de datos

No requiere SQL nuevo si ya están configuradas las tablas de compartidas.

Si nunca se configuró esta parte, ejecutar:

```txt
sql/03-supabase-shared-accounts.sql
```

## Validación

- `script.js`: OK.
- `profile.js`: OK.
- `shared-utils.js`: OK.
- `index.html`: sin IDs duplicados.
- `perfil.html`: sin IDs duplicados.
- `privacidad.html`: sin IDs duplicados.
- `styles.css`: llaves balanceadas.
- Service worker: `cuenta-clara-v13.14`.

## Instalación

1. Descomprime el ZIP.
2. Sube los archivos a tu repositorio.
3. Publica en Vercel como en versiones anteriores.
