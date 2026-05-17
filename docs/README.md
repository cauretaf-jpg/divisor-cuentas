# Cuenta Clara V13.16

Versión enfocada en mejorar el uso real cuando hay muchos amigos, reducir ruido visual y preparar recordatorios por WhatsApp de manera controlada.

## Nuevo en V13.16

- Buscador en **Agregar personas desde amigos**.
- Filtro por nombre, correo o teléfono.
- Contador de amigos visibles y seleccionados.
- **Personas frecuentes** queda oculto por defecto y se abre solo con botón.
- En estadísticas, **Personas frecuentes** queda colapsado para reducir lectura.
- Nueva sección de **Notificaciones WhatsApp** en Pagos.
- Activación manual de recordatorios WhatsApp.
- Botón para preparar pendientes por WhatsApp.
- Mensaje claro: WhatsApp siempre requiere confirmación del usuario; la app no envía mensajes automáticamente.
- Ajustes móviles compactos para buscador, tarjetas y botones.

## Importante sobre WhatsApp

Desde una app web normal, Cuenta Clara puede preparar mensajes y abrir WhatsApp, pero no puede enviarlos automáticamente sin confirmación. El envío automático real requeriría integración backend con WhatsApp Business API.

## Base de datos

No requiere SQL nuevo.

## Validación

- `script.js`: OK.
- `profile.js`: OK.
- `shared-utils.js`: OK.
- `index.html`: sin IDs duplicados.
- `perfil.html`: sin IDs duplicados.
- `privacidad.html`: sin IDs duplicados.
- `styles.css`: llaves balanceadas.
- Service worker: `cuenta-clara-v13.16`.

## Instalación

1. Descomprime el ZIP.
2. Sube los archivos a tu repositorio.
3. Publica en Vercel como en versiones anteriores.
