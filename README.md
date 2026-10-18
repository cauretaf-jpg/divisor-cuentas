# Cuenta Clara — Estado del proyecto

**Versión propuesta en rama:** `v2.0.0-simple` (producción sigue en v13.21.0)  
**Base de esta versión:** `Cuenta-Clara-v13.20.4-acceso-sesion-y-readme`  
**Tipo de proyecto:** aplicación web estática publicada en Vercel, con Supabase para autenticación, sincronización, amistades y cuentas compartidas.

> Este README es la bitácora de continuidad del proyecto. Cada ZIP nuevo debe actualizar este archivo, agregar una nota técnica en `docs/revisiones/` y una validación en `docs/validaciones/`.

---

## 0. Nueva experiencia: Cuenta Clara 2.0 Simple (octubre 2026)

**Estado: implementación realizada en rama, pendiente de publicación y prueba de sincronización con usuarios reales.**

El inicio por defecto (`index.html`) ahora es una calculadora de **tres pantallas**: elegir Bar/Restaurante/Supermercado/Otro → registrar gastos/personas/propina/pagador → ver y compartir resultado. No exige registro.

- Motor `simple-core.js`: división CLP igualitaria o personalizada, productos, cantidades, consumidores, propinas (igual, proporcional o manual y exenciones), pagadores múltiples, conciliación manual y transferencias.
- Interfaz `simple-app.js` + `simple.css`, responsiva y desvinculada de las pantallas de administración anteriores.
- Historial y borrador guardados localmente; recuperación tras recarga y opciones de compartir, copiar y WhatsApp.
- Registro y sincronización **opcionales** mediante Supabase. La tabla `simple_calculations` y su RLS se crearon con `sql/09-simple-calculations-2026-10.sql`, aplicado a `cuenta-clara-db` sin modificar tablas anteriores.
- PWA: `manifest.json` apunta a `index.html` y el worker almacena los archivos nuevos.
- **Compatibilidad anterior:** `app.html?advanced=1` mantiene íntegra la aplicación previa; `app.html#shared` preserva invitaciones compartidas. Sus datos anteriores no se borraron ni migraron.
- Pruebas Node y Chromium (390 px y 1280 px), guardado local y cálculos. **No** se afirma todavía que la sincronización E2E esté validada sin dos sesiones Supabase reales.
- Publicación pública no realizada: se trabaja en la rama `feature/cuenta-clara-2-calculadora-simple` y PR borrador.
- Bitácora técnica: `docs/revisiones/CUENTA_CLARA_2_SIMPLE_2026_10.md`.
- CI: `.github/workflows/simple-calculator-ci.yml`.

Las secciones de este README que describen v13.21.0 se mantienen como documentación **de la versión avanzada**, no de la nueva experiencia predeterminada.

---

## 1. Objetivo de la app

Cuenta Clara permite crear, dividir, revisar y cobrar cuentas compartidas de forma simple, especialmente desde celular.

Flujo central:

1. Crear una cuenta o usar una plantilla.
2. Agregar participantes.
3. Registrar gastos o total rápido.
4. Revisar reparto, pendientes y validaciones.
5. Compartir cobros y registrar pagos.

Además incluye historial, cuentas recurrentes, respaldo/importación, boletas, perfil financiero, amistades y cuentas compartidas.

---

## 2. Estado funcional actual

### Núcleo funcional

- Asistente guiado para `Nueva cuenta`.
- Plantillas para restaurante, supermercado, hogar, streaming, viaje y cuenta rápida.
- Participantes manuales, sugerencias y opción `Yo` con sesión iniciada.
- Gastos detallados, boleta/OCR, total rápido, propina y reparto por consumidor.
- Resumen final, validaciones, pagos, comprobantes y mensajes listos para WhatsApp.
- Historial con filtros, archivado, exportación, importación y respaldo.
- Cuentas recurrentes y continuidad mensual.

### Usuarios y colaboración

- Registro, inicio de sesión, recuperación de contraseña y cierre de sesión con Supabase Auth.
- Sincronización del estado en la nube para usuarios autenticados.
- Perfil público, amigos, solicitudes e invitaciones.
- Cuentas compartidas con roles e interacción básica entre usuarios.
- Base preparada para notificaciones push, pendiente de configuración final si se quiere uso real con la app cerrada.

### Navegación actual

- `index.html`: landing pública.
- `app.html`: aplicación principal.
- `perfil.html`: perfil, amigos y configuración personal.
- La cuenta activa mantiene pestañas internas: **Personas**, **Gastos**, **Resumen** y **Pagos**.
- En móvil existe navegación inferior fija y una experiencia más cercana a app nativa.

---

## 3. Cambios incorporados en v13.21.0

### Objetivo de esta iteración

Tomar como inspiración visual una app móvil de referencia enviada por el usuario y acercar **Cuenta Clara** a una experiencia más parecida a una app nativa de celular, especialmente en la navegación, el inicio y el menú móvil.

### Cambios aplicados

#### A. Navegación inferior móvil rediseñada

Se cambió el menú inferior para que se parezca más al patrón de la app de referencia:

- **Inicio**
- **Historial**
- **Nueva** (botón central destacado)
- **Pagos**
- **Menú**

Esto da más protagonismo a `Historial de cuentas`, que era una necesidad ya mencionada, y deja `Nueva cuenta` como acción principal desde móvil.

#### B. Inicio móvil más limpio y tipo dashboard

La pantalla inicial móvil fue reorganizada para verse más parecida a una app descargada:

- saludo principal más visible,
- tarjeta destacada para la cuenta activa,
- resumen rápido con KPIs,
- bloque de acciones inmediatas,
- accesos rápidos tipo mosaico,
- historial reciente con mayor visibilidad.

Además, en móvil se ocultan algunos bloques globales que estaban generando ruido visual en Inicio, como indicadores intermedios redundantes.

#### C. Nueva vista `Menú` móvil

La sección `Más herramientas` fue reinterpretada como un **Menú** móvil más claro, con estructura parecida a la app de referencia:

- bloque de perfil superior,
- grupo **Mi cuenta**,
- grupo **Cuenta activa**,
- grupo **Soporte**,
- botones finales de acción (`Nueva cuenta` y `Cerrar sesión` cuando hay usuario autenticado).

Desde este menú ahora es más fácil entrar a:

- Historial,
- Hogar/Recurrentes,
- Compartidas,
- Personas,
- Gastos,
- Resumen,
- Pagos,
- Perfil,
- Privacidad,
- Términos,
- Contacto.

#### D. Ajustes visuales mobile-first

- Tarjetas más limpias y redondeadas.
- Fondo móvil más suave y menos recargado.
- Botones más consistentes con una estética de app.
- Acción principal central más clara.
- Menos saturación visual en secciones clave.

#### E. Mantenimiento técnico

- Se actualizó versión a `v13.21.0`.
- Se actualizaron referencias `?v=` de CSS/JS/HTML relacionados.
- Se actualizó `service-worker.js` para evitar servir archivos antiguos desde caché.
- Se dejó nueva bitácora técnica y archivo de validación.

### Qué no cambió

- No se modificó la lógica de cálculo de cuentas.
- No se modificó la estructura SQL.
- No se cambió la lógica base de compartidas, pagos o historial.
- No se eliminó navegación de escritorio.

---

## 4. Arquitectura principal de archivos

| Archivo o carpeta | Responsabilidad |
|---|---|
| `index.html` | Landing pública y entrada al sitio. |
| `app.html` | Aplicación principal. |
| `script.js` | Estado, UI, cálculos, autenticación, sincronización, historial y colaboración. |
| `styles.css` | Estilos globales y responsive. Archivo histórico; los cambios nuevos se agregan al final. |
| `shared-utils.js` | Utilidades de formato, normalización e IDs. |
| `supabase-config.js` | Conexión cliente con Supabase. |
| `perfil.html` / `profile.js` | Perfil del usuario, amigos y configuración asociada. |
| `service-worker.js` | Caché PWA y notificaciones push. |
| `sql/` | Scripts de base de datos para Supabase. |
| `supabase/functions/` | Edge Functions relacionadas con push u otras integraciones. |
| `docs/revisiones/` | Bitácora técnica por versión. |
| `docs/validaciones/` | Resultados de validaciones por versión. |
| `tools/subir-cuenta-clara-github.cmd` | Script de apoyo para publicar cambios desde Windows. |

---

## 5. Persistencia y modos de uso

### Modo invitado

- Guarda en `localStorage` del navegador.
- No sincroniza entre dispositivos.
- Sirve para usar la app sin registro.
- Recomendable exportar respaldo si se cambiará de equipo o se limpiará el navegador.

### Usuario con sesión

- Usa Supabase Auth.
- Mantiene copia local y copia sincronizada en la nube.
- Habilita perfil, amistades, invitaciones y cuentas compartidas.

---

## 6. Requisitos de Supabase

Para levantar un proyecto nuevo, ejecutar en orden:

1. `sql/01-supabase-app-state.sql`
2. `sql/02-supabase-social.sql`
3. `sql/03-supabase-shared-accounts.sql`
4. `sql/04-supabase-push-subscriptions.sql` si se usarán notificaciones push reales.

Además:

- En Auth debe estar habilitado **Email/Password**.
- Las URLs publicadas deben estar agregadas en Redirect URLs.
- Si se usa recuperación de contraseña, revisar que la ruta publicada quede permitida para el retorno.

---

## 7. Publicación

La app está preparada para publicarse como sitio estático en Vercel.

### Antes de publicar

1. Subir archivos del proyecto actualizado.
2. Confirmar que los cambios de versión (`?v=` y `CACHE_NAME`) estén actualizados.
3. Verificar navegación móvil real o al menos emulación responsiva.
4. Validar encabezado, navegación inferior y sección Menú en móvil.

### Rutas clave

- `/` → landing pública.
- `/app` → aplicación principal.
- `/perfil` → perfil.

---

## 8. Validación mínima recomendada

Antes de entregar o publicar:

1. `node --check script.js`
2. `node --check profile.js`
3. `node --check shared-utils.js`
4. `node --check service-worker.js`
5. Revisar IDs duplicados en `app.html`.
6. Confirmar funcionamiento de navegación inferior móvil.
7. Confirmar que `Nueva` del menú inferior abra el flujo guiado.
8. Confirmar que `Menú` muestre la nueva estructura móvil.
9. Confirmar que `Historial` quedó visible y accesible desde la barra inferior.

---

## 9. Pendientes sugeridos para la próxima versión

### Prioridad alta

- Seguir acercando todo el móvil a una experiencia aún más uniforme tipo app descargada.
- Revisar la pantalla de login/registro para que también tome este lenguaje visual.
- Probar en dispositivo real el nuevo menú móvil y la barra inferior.
- Validar con dos usuarios reales el flujo completo de cuentas compartidas e invitaciones.

### Prioridad media

- Reorganizar aún más la sección Home para que algunas tarjetas sean configurables.
- Mejorar buscador/agregado desde amigos dentro del flujo de personas.
- Refinar OCR de boletas con cantidades y confirmación guiada.
- Añadir indicadores más visibles de guardado y sincronización.

### Prioridad baja

- Empujar el diseño de escritorio hacia el mismo sistema visual móvil.
- Explorar un modo “compacto” adicional para pantallas pequeñas.

---

## 10. Convención para futuras iteraciones

Cada ZIP nuevo debe incluir:

- `README.md` actualizado.
- una nota nueva en `docs/revisiones/`,
- una validación nueva en `docs/validaciones/`,
- actualización de versión en scripts y caché,
- resumen claro de cambios funcionales, visuales, riesgos y dependencias.
