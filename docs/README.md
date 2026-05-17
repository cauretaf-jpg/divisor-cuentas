# Cuenta Clara V13.17

Versión enfocada en **notificaciones del celular** y **estado de conexión**, manteniendo como base la v13.16.1.

## Nuevo en V13.17

- Nueva sección **Estado de conexión** dentro de Herramientas.
- Estado visible de:
  - sesión;
  - sincronización;
  - solicitudes pendientes;
  - notificaciones del celular.
- Botón **Activar notificaciones**.
- Botón **Probar aviso**.
- El service worker ahora soporta eventos `push` y `notificationclick`.
- Al tocar una notificación, la app puede abrir directamente **Compartidas**.
- Cuando se envía una solicitud de cuenta compartida, la app intenta llamar una Edge Function opcional para push real.
- Si el backend push no está configurado, la app no falla: mantiene el centro de notificaciones interno.

## Funciona sin configuración adicional

- Solicitudes dentro de la app.
- Badges y contadores.
- Panel Estado de conexión.
- Permiso de notificaciones del navegador.
- Aviso de prueba.
- Avisos del sistema cuando el navegador lo permite y la app detecta solicitudes nuevas.

## Push real con la app cerrada

Para que el celular reciba avisos aunque Cuenta Clara no esté abierta, se requiere configuración adicional:

1. Ejecutar `sql/04-supabase-push-subscriptions.sql`.
2. Generar claves VAPID.
3. Pegar la clave pública en `supabase-config.js`:
   `window.CUENTA_CLARA_PUBLIC_VAPID_KEY = '...'`.
4. Desplegar `supabase/functions/send-shared-invite-push`.
5. Configurar variables de entorno:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
6. Cada usuario debe iniciar sesión y presionar **Activar notificaciones**.

## Validación

- `script.js`: OK.
- `profile.js`: OK.
- `shared-utils.js`: OK.
- `service-worker.js`: OK.
- `index.html`: sin IDs duplicados.
- `perfil.html`: sin IDs duplicados.
- `privacidad.html`: sin IDs duplicados.
- `styles.css`: llaves balanceadas.
- Service worker: `cuenta-clara-v13.17`.

## Publicación

1. Descomprime el ZIP.
2. Sube los archivos a GitHub.
3. Publica en Vercel.
4. Recarga fuerte o reinstala la PWA si el navegador conserva caché anterior.
