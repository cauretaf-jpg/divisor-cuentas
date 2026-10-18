# Cuenta Clara — Estado del proyecto

**Versión de desarrollo:** `v13.23.0` (rama de rediseño; producción todavía no actualizada)  
**Base de esta versión:** `Cuenta-Clara-v13.20.4-acceso-sesion-y-readme`  
**Tipo de proyecto:** aplicación web estática publicada en Vercel, con Supabase para autenticación, sincronización, amistades y cuentas compartidas.

> Este README es la bitácora de continuidad del proyecto. Cada ZIP nuevo debe actualizar este archivo, agregar una nota técnica en `docs/revisiones/` y una validación en `docs/validaciones/`.

---


## 0A. Desarrollo v13.23.0 — Inicio e Historial rediseñados (18/10/2026)

Se implementó el nuevo **Inicio móvil** en una rama separada con pregunta principal «¿Qué quieres dividir hoy?» (Bar, Restaurante, Supermercado, Hogar), enlace al resto de categorías y creación mediante el asistente guiado. Se priorizó Historial reciente, con apertura directa al resumen, métricas globales separadas de las de la cuenta seleccionada y sincronización discreta.

El **Historial de cuentas** ahora aparece con un acceso destacado, métricas, filtros rápidos, buscador, lista completa por defecto, contador de resultados y acciones conservadas. Se mantuvieron datos, estructura de Supabase, modo invitado, pagos, borradores, cuentas compartidas y recurrencia.

El rediseño usa CSS responsive y las variables actuales de modo oscuro. No se borraron datos ni se crearon bases de datos. Se añadieron pruebas de navegación estructural y conteos, manteniendo los tests del asistente, propina y seguridad.

**Estado:** pruebas automatizadas aprobadas; pendiente validación visual en móvil/escritorio y E2E con usuarios reales antes de fusionar o publicar en producción.

Bitácora: `docs/revisiones/REDISENO_INICIO_HISTORIAL_V13_23_0.md`.

---

## 0. Desarrollo v13.22.0 — asistente contextual (17/10/2026)

**Estado:** candidato de prueba en rama `feature/asistente-contextual-propinas-2026-10`. La publicación principal y la base de datos no se han modificado. No corresponde considerar esta versión totalmente validada hasta realizar pruebas manuales en móviles y verificar Supabase.

### Cambios funcionales

- La primera pantalla del asistente pregunta **«¿Qué quieres dividir hoy?»**.
- Se agregaron contextos **Bar, Cafetería y Juntada o evento**; continúan Restaurante, Supermercado, Hogar, Viaje, Streaming, Cuenta rápida y Otra cuenta.
- Sugerencias de consumo configuradas por contexto (por ejemplo cerveza, mojito, empanadas, papas, queso y café). Seleccionar una sugerencia prepara nombre y categoría, **no crea un gasto ni inventa su precio**.
- Para bar, restaurante y cafetería: propina 0 %, 10 % o porcentaje personalizado (0–100); asignación proporcional al consumo, en partes iguales o con montos personalizados y personas exentas. Las asignaciones personalizadas deben sumar el total de propina para finalizar.
- Revisión del asistente muestra la propina y valida repartos personalizados incompletos.
- Se corrigió el reinicio no deseado del porcentaje de propina y del modo total rápido al volver a un paso o editar un borrador.
- Los cálculos ahora excluyen la deuda arrastrada al determinar la propina; se aplica también al detalle exportable por persona.
- La vista móvil presenta tarjetas contextuales compactas y accesos rápidos de productos.
- El asistente permite cantidad por producto y subtotal opcional de boleta sin propina. La revisión bloquea finalizar si los productos no cuadran con ese subtotal.
- La revisión presenta los montos por participante, separados en subtotal y propina.
- Todo esto funciona sobre estado de cuenta existente y no requiere modificar tablas SQL.


### Verificaciones realizadas

- Interpretación del JavaScript sin errores de sintaxis.
- Casos de prueba aislados para propina proporcional, igualitaria, personalizada, exenciones, total rápido y exclusión de deudas anteriores.
- Validaciones de las referencias de archivos v13.22.0 y caché PWA.
- El despliegue de **vista previa** en Vercel llegó a estado `READY`.

### Limitaciones y pendientes — no afirmar validación de extremo a extremo

- Se necesita acceso a la **base Supabase utilizada por Cuenta Clara** para inspeccionar RLS, persistencia, usuarios, invitaciones y datos compartidos. La conexión disponible solo mostró otros proyectos.
- Falta prueba manual en navegador y celular con dos perfiles reales, incluyendo accesibilidad, flujo rápido, productos, propinas y pagos.
- Las funciones de **pagadores múltiples**, reparto total personalizado/mixto, conciliación directa con boleta y diseño completo de todas las vistas siguen siendo trabajo posterior; no están implementadas por esta revisión.
- No se borraron carpetas históricas (`assets/` duplicado) ni componentes antiguos sin rastrear sus dependencias y confirmar el origen del despliegue.
- No se ejecutaron cambios SQL ni migraciones en producción.

Más detalles en `docs/revisiones/REVISION_ASISTENTE_V13_22_0.md` y resultados reproducibles en `docs/validaciones/revision-validacion-v13-22-0.json`.

---

### Supabase — revisión de seguridad del 18 de octubre de 2026

Se verificó el acceso correcto a `cuenta-clara-db` y se aplicaron **cuatro migraciones de seguridad y rendimiento directamente en Supabase**:
1. Permisos de funciones: se eliminó ejecución por anónimos y se conservaron las RPC de colaboración para usuarios autenticados.
2. Siete índices nuevos para claves foráneas.
3. Optimización de 35 políticas RLS sin cambiar sus criterios de acceso.
4. Las invitaciones pendientes ya no entregan el contenido completo de una cuenta; la nueva RPC solo permite consultar su título hasta aceptar.

Las migraciones están documentadas en `sql/05-` a `sql/08-` y en `docs/revisiones/REVISION_SEGURIDAD_SUPABASE_2026_10_18.md`.

**Distinción importante:** las migraciones de base de datos están aplicadas; la nueva interfaz y los cambios JavaScript siguen **en la rama de desarrollo sin fusionar**. Los tests de GitHub y el preview de Vercel están aprobados, pero no hay aún pruebas E2E con dos usuarios reales. Se requiere probar aceptación y rechazo de invitaciones, roles, perfil, pagos y sincronización antes de fusionar.

Advertencias residuales de Supabase: funciones `SECURITY DEFINER` ejecutables por usuarios autenticados (necesarias para colaboración, con autorización interna), protección de contraseñas filtradas pendiente de configuración en Supabase Auth e información de índices con uso aún no detectado.

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
