# Cuenta Clara — Estado del proyecto

**Versión actual:** `v13.20.4`  
**Base de esta versión:** `Cuenta-Clara-v13.20.3-pestanas-cuenta-activa`  
**Tipo de proyecto:** aplicación web estática, publicada en Vercel, con Supabase para autenticación, estado sincronizado, amigos y cuentas compartidas.

> Este documento es el punto de continuidad del proyecto. Debe actualizarse en cada ZIP entregado, junto con una nota técnica en `docs/revisiones/` y una validación en `docs/validaciones/`.

## 1. Qué resuelve la aplicación

Cuenta Clara permite crear y dividir cuentas entre personas. El flujo central es:

1. Crear una cuenta (restaurante, hogar, streaming, viaje u otro caso).
2. Agregar participantes.
3. Registrar un total rápido o gastos detallados.
4. Revisar cuánto corresponde a cada persona.
5. Registrar pagos y preparar un resumen para WhatsApp.

La aplicación también incluye historial de cuentas, cuentas recurrentes, respaldo/importación, boletas, perfil financiero, amistades, cuentas compartidas e invitaciones entre usuarios registrados.

## 2. Estado funcional actual

### Flujo principal

- Asistente guiado para `Nueva cuenta`, con pasos, validaciones, revisión final tipo semáforo y posibilidad de guardar borrador al cancelar.
- Tipos y plantillas de cuenta disponibles para escenarios frecuentes.
- Participantes manuales y opción `Yo` cuando existe sesión iniciada.
- División de gastos, productos, propina, responsables de pago y resumen de deudas.
- Registro de pagos, comprobantes y mensajes preparados para WhatsApp.
- Exportación a Excel, imagen de resumen, respaldo e importación.
- Historial, archivado y vistas de cuentas activas/cerradas.

### Navegación y experiencia

- `index.html` es la landing pública.
- `app.html` es la aplicación principal.
- Las cuentas activas usan pestañas internas: **Personas**, **Gastos**, **Resumen** y **Pagos**.
- En móvil existe navegación inferior y la interfaz prioriza información progresiva para no saturar la pantalla.

### Usuarios, nube y colaboración

- Registro, inicio de sesión, cierre de sesión y recuperación de contraseña mediante Supabase Auth.
- Estado personal sincronizado en `app_states` al iniciar sesión.
- Perfil público, búsqueda de amigos y solicitudes de amistad.
- Cuentas compartidas con invitación, aceptación/rechazo y roles.
- Suscripciones push preparadas; requieren configuración adicional de VAPID/Edge Function para notificaciones reales con la app cerrada.

## 3. Ajuste incorporado en v13.20.4

### Problema corregido

En pantallas de hasta `480px`, una regla CSS ocultaba todos los botones del encabezado excepto `Nueva cuenta`. Esto incluía accidentalmente el botón de acceso. Además, la landing pública mostraba solo `Abrir app`, sin indicar que existía inicio de sesión.

### Cambios aplicados

- El botón de invitado ahora se llama claramente **Iniciar sesión**.
- En modo invitado se muestra un único punto de entrada: **Iniciar sesión**.
- Con una sesión activa, el acceso cambia a **Mi perfil · nombre**.
- En móvil pequeño el botón de inicio de sesión permanece visible.
- La landing y las páginas públicas incorporan una CTA explícita **Iniciar sesión**.
- Desde la landing, `app.html?auth=login` abre directamente el modal de inicio de sesión; `?auth=register` abre el registro.
- También se mantiene la alternativa **Usar como invitado** en la landing.

No se modificaron tablas, políticas RLS, estructura del estado, cuentas existentes ni lógica de cálculo.

## 4. Arquitectura de archivos

| Archivo o carpeta | Responsabilidad |
|---|---|
| `index.html` | Landing pública y entrada principal del sitio. |
| `app.html` | Interfaz completa de la aplicación. |
| `script.js` | Estado local, UI, cálculos, asistente, autenticación, sincronización, historial, compartidas y eventos. |
| `styles.css` | Estilos globales, responsive y componentes. Es un archivo histórico grande; los ajustes nuevos se agregan al final con versión. |
| `shared-utils.js` | Utilidades compartidas de normalización y formato. |
| `supabase-config.js` | Cliente de Supabase para navegador. |
| `profile.js` / `perfil.html` | Perfil, amigos y vistas relacionadas con el usuario. |
| `service-worker.js` | Cache PWA y recepción de notificaciones push. |
| `sql/` | Scripts SQL de Supabase. No se publican en Vercel. |
| `supabase/functions/` | Funciones Edge relacionadas con push. No se publican como sitio estático. |
| `docs/revisiones/` | Bitácora técnica por versión. |
| `docs/validaciones/` | Resultados de validaciones estructurales por versión. |
| `tools/subir-cuenta-clara-github.cmd` | Script local de apoyo para subir cambios a GitHub desde Windows. |

## 5. Datos y persistencia

### Modo invitado

- Usa `localStorage` en el navegador actual.
- Permite crear cuentas sin registro.
- No sincroniza datos entre equipos.
- Conviene exportar respaldo antes de limpiar datos del navegador o cambiar de equipo.

### Usuario con sesión

- Usa Supabase Auth para la identidad.
- Mantiene una copia local por usuario y sincroniza el estado en `public.app_states`.
- Habilita perfil, amistades, invitaciones y cuentas compartidas.

## 6. Requisitos de Supabase

Ejecutar los scripts en este orden cuando se configure un proyecto nuevo:

1. `sql/01-supabase-app-state.sql`
2. `sql/02-supabase-social.sql`
3. `sql/03-supabase-shared-accounts.sql`
4. `sql/04-supabase-push-subscriptions.sql` solo si se habilitarán avisos push reales.

En Supabase Auth debe estar habilitado Email/Password. Para recuperación de contraseña, la URL publicada debe estar agregada a las Redirect URLs de Supabase, incluyendo la ruta `/app?recuperar=1`.

## 7. Publicación

La aplicación se publica como sitio estático en Vercel.

- La raíz `/` abre la landing pública.
- `/app` redirige internamente a `app.html` mediante `vercel.json`.
- `/perfil` abre `perfil.html`.
- Antes de publicar, subir todos los archivos del ZIP, excepto los directorios ignorados por `.vercelignore`.
- Cada versión debe cambiar los parámetros `?v=` de CSS/JS y el `CACHE_NAME` del service worker. Esto evita que usuarios PWA vean archivos antiguos desde caché.

## 8. Validación mínima antes de entregar o publicar

1. `node --check script.js`
2. `node --check profile.js`
3. `node --check shared-utils.js`
4. `node --check service-worker.js`
5. Confirmar que `app.html` no tenga IDs duplicados.
6. Confirmar llaves balanceadas en `styles.css`.
7. Probar en ancho móvil de 390px: debe aparecer **Iniciar sesión** cuando el usuario está como invitado.
8. Probar `app.html?auth=login`: debe abrir el modal de acceso.
9. Probar una sesión existente: el encabezado debe mostrar **Mi perfil** y no el botón de acceso.

## 9. Pendientes recomendados para la siguiente iteración

Prioridad alta:

- Reforzar el lugar de **Historial de cuentas** en la navegación y en Inicio.
- Revisar el flujo completo de invitación entre amigos en un entorno publicado con dos usuarios reales.
- Validar móvil en dispositivos reales, especialmente asistentes, pestañas internas y modales.
- Configurar VAPID/Edge Function si se desea que las notificaciones push funcionen con la app cerrada.

Prioridad media:

- Pulir búsqueda de amigos en la selección de participantes.
- Completar OCR de boletas con cantidades y controles de revisión.
- Definir permisos más granulares para miembros de cuentas compartidas.
- Agregar indicadores más visibles de último guardado y de sincronización.

## 10. Convención para futuras versiones

Para mantener continuidad, cada nuevo ZIP debe incluir:

- Actualización de este `README.md`.
- Una nota nueva: `docs/revisiones/REVISION_TECNICA_Vx_y.txt`.
- Un archivo de validación: `docs/validaciones/revision-validacion-vx-y.json`.
- Actualización de versión en `script.js`, referencias de cache (`?v=`) y `service-worker.js`.
- Una lista breve de cambios funcionales, cambios visuales, riesgos conocidos y si requiere SQL nuevo.
