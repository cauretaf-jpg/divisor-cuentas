# Cuenta Clara V11.1


- Diseño visual más consistente en tarjetas, botones e insignias.
- Inicio rápido con tarjetas más limpias y jerarquía visual.
- Barra lateral descriptiva más elegante, con estados activos más claros.
- Formularios, chips, listas y estados vacíos con terminación más moderna.
- Mejoras visuales en Perfil, estadísticas, pagos y modo oscuro.
- Sin cambios en SQL ni en la lógica de cálculos.
App web funcional para dividir cuentas entre varias personas.


- Se elimina la sección Configuración del menú principal.
- El botón Editar del Historial ahora abre directamente la sección Gastos.
- El monto de Cuenta rápida queda disponible en Gastos.
- El mes de Cuenta hogar queda disponible en Hogar.

## Nuevo en V11.1 - Limpieza de configuración e historial

- El botón **Nueva cuenta** ahora solicita nombre antes de crear la cuenta.
- Si se cancela la solicitud de nombre, no se crea una cuenta vacía.
- Al crear desde el botón principal, la app abre **Personas** para continuar con participantes y pagador principal.
- El lector de boletas permite tomar una foto o subir una imagen desde galería/archivos en celular.
- Se actualizó el cache de la PWA para que el móvil cargue los cambios nuevos.

## Nuevo en V10.9 - Sincronización completa con Supabase

- Se reforzó el guardado completo en `app_states`: cuentas, personas, gastos, propinas, pagos, productos rápidos, perfil, amigos y grupos recurrentes.
- Si el usuario inicia sesión y todavía no existe una fila en `app_states`, la app crea el respaldo inicial automáticamente usando la copia local disponible.
- El botón **Guardar ahora** indica si Supabase guardó correctamente o si solo quedó copia local.
- Los errores de Supabase ahora explican si falta ejecutar `sql/01-supabase-app-state.sql` o si hay un problema de políticas RLS.
- La página **Mi Perfil** conserva datos auxiliares del estado completo al guardar perfil, evitando pérdida de grupos recurrentes u otros campos.
- Para activar esta versión correctamente, ejecuta `sql/01-supabase-app-state.sql` en Supabase.


## Nuevo en V10.8 - Pulido visual final

- Se reforzó la vista móvil de la app principal.
- La navegación por secciones ahora se adapta mejor en celular y mantiene descripciones visibles.
- Se corrigieron anchos de formularios, tarjetas, botones, resumen de pagos y cobros del perfil.
- Se mejoró la responsividad del Perfil, pestañas de estadísticas y acciones principales.
- No cambia SQL ni lógica de Supabase.

## Nuevo en V10.6 - Cobros del perfil cuando “Yo” paga

- En **Pagos** aparece un bloque especial cuando el perfil activo es el pagador principal.
- Muestra cuánto pagaste por todos, cuánto te corresponde a ti y cuánto tienes pendiente por recibir.
- El bloque indica quiénes te deben dinero según las personas marcadas como pendientes.
- En **Perfil → Estadísticas → Pagos y recurrentes** se agregan indicadores acumulados de tus pagos como pagador principal.
- También se muestra un ranking de quién te debe cuando tú pagas.
- Mantiene la mejora de V10.5: participante **“Yo”** vinculado al perfil.
- No requiere ejecutar SQL nuevamente si V10.5 ya funcionaba.

## Nuevo en V10.4 - Estadísticas de perfil ampliadas

- La sección **Estadísticas** del perfil ahora tiene pestañas internas: **Resumen**, **Gastos**, **Personas**, **Pagos y recurrentes** y **Actividad**.
- Se agregaron indicadores de total administrado, promedio por cuenta, personas distintas, cuentas compartidas y cierre de pagos.
- Se incorporó análisis de categorías, cuentas más altas, gasto por mes y actividad reciente.
- La vista de personas ahora muestra personas frecuentes, montos asociados y pendientes por persona.
- La vista de pagos muestra cuentas pagadas, pendientes, total pagado, total pendiente y datos de recurrentes.
- No requiere ejecutar SQL nuevamente si V10.3/V9.x ya funcionaba.

## Nuevo en V10.2 - Flujo de cuenta nueva y barra descriptiva

- La barra lateral vuelve a mostrar descripciones pequeñas por pestaña.
- La barra lateral no tiene scroll interno en escritorio; si necesita espacio, baja con la página.
- En Inicio, las opciones principales crean una cuenta nueva.
- “Ver mis cuentas anteriores” abre Historial sin crear una cuenta nueva.
- Las cuentas nuevas abren Configuración para definir pagador principal y propina.


## Nuevo en V10.1 - Historial y navegación más limpia

- Barra lateral compacta para evitar scroll en escritorio.
- Inicio rápido incluye acceso a Ver mis cuentas anteriores.
- Historial incluye botones Editar y Eliminar por cuenta.

## Nuevo en V10.0 - Navegación por secciones

- La pantalla principal ahora se organiza con una barra lateral de navegación, inspirada en la metodología usada en Consulta AIEP.
- Se agregaron secciones independientes: **Inicio**, **Personas**, **Gastos**, **Resumen**, **Pagos**, **Historial**, **Hogar**, **Compartidas** y **Configuración**.
- Al seleccionar una sección, se muestra solo ese contenido para reducir ruido visual.
- **Inicio** mantiene la guía “¿Qué quieres hacer?” y el siguiente paso recomendado.
- El botón inteligente ahora abre automáticamente la sección correspondiente: personas, gastos, configuración o pagos.
- En móvil, la navegación lateral se transforma en una barra horizontal superior.
- No requiere ejecutar SQL nuevamente si V9.7/V9.6 ya funcionaba.

## Nuevo en V9.7 - Pulido visual de gastos y personas

- Se limpió visualmente la sección **Agregar gasto**.
- Las opciones **Escribir**, **Escanear boleta** y **Productos rápidos** ahora se muestran como accesos compactos.
- **Productos rápidos** ocupa menos espacio y mantiene el botón para editar accesos.
- El formulario de gasto quedó más equilibrado, con mejor ancho para **Cómo se divide este gasto**.
- **Gasto recurrente** se muestra como opción compacta, sin caja grande vacía.
- La sección **Personas** ahora usa todo el ancho disponible.
- Las tarjetas de participantes son más compactas, legibles y ordenadas.
- Se acortó el campo de teléfono a **WhatsApp opcional** y el botón a **Agregar persona**.
- No requiere ejecutar SQL nuevamente si V9.6/V9.5 ya funcionaba.

## Nuevo en V9.5 - Recurrentes más claros

- La sección **Cuenta recurrente** ahora separa **Mes actual**, **Deuda acumulada** e **Historial mensual**.
- El panel recurrente permite marcar pagos como **Pagado** o **Pendiente** desde la misma vista.
- El historial mensual permite abrir meses anteriores conectados a la carpeta recurrente.
- Se muestra **Pendiente vigente** basado en el último mes conectado.
- Crear el siguiente mes ahora muestra una confirmación indicando si se arrastrará deuda pendiente.
- No requiere ejecutar SQL nuevamente si V9.4 ya funcionaba.

## Nuevo en V9.4 - Compartidas más claras

- La sección **Compartidas** ahora separa visualmente **Invitaciones pendientes**, **Creadas por mí** y **Compartidas conmigo**.
- Las invitaciones pendientes tienen botones **Aceptar** y **Rechazar**.
- Se muestra un resumen compacto del estado de la cuenta compartida actual y conteos de invitaciones.
- No requiere ejecutar SQL nuevamente si V9.3/V9.2 ya funcionaba.

## Nuevo en V9.2 - Cuentas recurrentes y compartidas - fix Supabase

- Nueva sección **Hogar / Recurrentes** en la barra lateral.
- Permite crear una carpeta recurrente mensual desde la cuenta actual, por ejemplo **Streaming**.
- Permite crear el siguiente mes conectado con el anterior.
- Si alguien queda pendiente, su deuda se arrastra al mes siguiente como **Deuda anterior**.
- Nueva sección **Compartidas**.
- Permite publicar una cuenta e invitar usuarios registrados por correo o nick.
- Los invitados aceptados pueden abrir y editar la cuenta compartida.
- Agrega el archivo **sql/03-supabase-shared-accounts.sql** para crear las tablas `shared_accounts` y `shared_account_members`.


## Incluye

- Crear varias cuentas.
- Historial con buscador y filtro por estado.
- Archivar y desarchivar cuentas.
- Crear, duplicar y eliminar cuentas.
- Editar nombre de cuenta.
- Agregar, editar y eliminar personas.
- Personas en formato compacto.
- Marcar personas como pagado o pendiente.
- Marcar todos como pagados o pendientes.
- Modo cuenta detallada.
- Modo cuenta rápida.
- Pagador principal.
- Cálculo de transferencias: quién debe pagarle a quién.
- Agregar productos con precio unitario, cantidad y categoría.
- Categorías: comida, bebestibles, tragos, postres, transporte y otros.
- Totales por categoría.
- Buscar y filtrar productos.
- Duplicar producto.
- Productos rápidos editables.
- Dividir productos entre una o varias personas.
- Asignar partes distintas por persona.
- Editar y eliminar productos.
- Calcular subtotal, propina, total final, pagado y pendiente.
- Estado general de la cuenta.
- Compartir como texto.
- Compartir como imagen.
- Resumen simple o con detalle.
- Descargar imagen PNG.
- Intentar compartir imagen con menú nativo.
- WhatsApp con texto directo.
- Copiar enlace de cuenta.
- Importar cuenta desde enlace.
- Exportar respaldo JSON.
- Importar respaldo JSON.
- Página de privacidad.
- Botón visible para instalar la app como PWA.
- Consumidores en grilla compacta.
- Exportación del resumen a Excel profesional con estilos.
- Botón flotante móvil con total, agregar y compartir.
- Guardado local en localStorage.
- Modo oscuro.
- Diseño responsive.
- Manifest y service worker básico para PWA.

## Cómo abrir

Abre `index.html` en el navegador.

Para probar la PWA y el service worker, usa un servidor local, por ejemplo la extensión Live Server de Visual Studio Code.

## Importante

Esta versión funciona sin login y sin base de datos externa.
Los datos quedan guardados solo en el navegador donde se usa la app.


## Nuevo en V2.1

- Se agregó el botón visible **Instalar App** en la barra superior.
- Si el navegador permite instalación PWA, el botón abre el flujo de instalación.
- Si el navegador no entrega el evento de instalación, muestra instrucciones para instalar desde el menú del navegador.
- Cuando la app ya está instalada, el botón cambia a **App instalada**.


## Nuevo en V2.2

- La sección **¿Quiénes consumieron?** ahora usa una grilla compacta para evitar listas muy largas.
- Se agregó botón **Exportar Excel** en el bloque de pagos.
- El Excel generado incluye hojas:
  - Resumen
  - Productos
  - Detalle por persona
  - Transferencias
  - Categorías
- El archivo Excel incluye montos, propina proporcional, estado de pago, pagador principal y transferencias.

Nota: la exportación Excel usa SheetJS desde CDN. Para exportar correctamente, prueba la app publicada en Vercel o con conexión a internet.


## Nuevo en V2.3

- Se corrigió la sección **¿Quiénes consumieron?** para que las personas queden realmente una al lado de la otra.
- Se redujo el tamaño de las tarjetas de consumidores para ahorrar espacio.
- Los **Productos rápidos** ahora son editables:
  - agregar producto rápido,
  - editar nombre y categoría,
  - eliminar producto rápido.
- Los productos rápidos personalizados se guardan en localStorage.


## Nuevo en V2.4

- Se cambió la exportación Excel a un diseño más profesional usando ExcelJS.
- El archivo Excel ahora incluye:
  - título visual por hoja,
  - colores de marca Cuenta Clara,
  - tarjetas KPI en la hoja Resumen,
  - encabezados con color,
  - bordes suaves,
  - filas alternadas,
  - formato moneda,
  - estados Pagado/Pendiente con color,
  - filtros automáticos,
  - columnas con ancho definido.
- Se mantienen las hojas:
  - Resumen
  - Productos
  - Detalle por persona
  - Transferencias
  - Categorías

Nota: la exportación profesional usa ExcelJS desde CDN. Para exportar correctamente, prueba la app publicada en Vercel o con conexión a internet.


## Nuevo en V2.5

- Se corrigieron montos con decimales largos en el Excel.
- Los montos ahora se redondean y se muestran con formato moneda.
- Se aumentó el ancho y alto de la columna Consumidores en la hoja Productos.
- En Detalle por persona se agregaron botones/celdas de navegación por persona.
- Cada botón lleva a una sección individual de esa persona dentro de la misma hoja.
- Se corrigió el formato de moneda en Transferencias.
- Se corrigió la hoja Categorías para aplicar el porcentaje en la columna correcta.


## Nuevo en V2.6

- Se quitó el congelado de celdas en la hoja Resumen del Excel.
- Se mantiene el congelado en hojas donde sí ayuda, como Productos.
- Se ajustó el formato moneda para mostrar el signo `$` en celdas de monto.
- Se mejoró la grilla de **¿Quiénes consumieron?**:
  - tarjetas más grandes,
  - nombres visibles sin cortes excesivos,
  - checkboxes más cómodos,
  - campo de partes más legible.


## Nuevo en V2.7

- En el Excel, todas las celdas de monto ahora se muestran explícitamente con signo `$`.
- Se evita que Excel/Google Sheets muestre montos como números simples sin formato.
- En la hoja Productos:
  - se redujo el ancho de la columna **Total producto**,
  - se amplió más la columna **Consumidores**,
  - se aumentó el alto de las filas para que los consumidores no se vean amontonados.


## Nuevo en V2.8

- Se corrigió el origen de las tablas del Excel: ahora comienzan correctamente en la columna A.
- Esto corrige el formato de moneda en:
  - Resumen → Total a pagar
  - Detalle por persona → Total con propina
  - Transferencias → Monto
  - Categorías → Total
- Se corrigió el problema donde aparecían columnas con `$0` en campos de texto como Persona o A quién.
- En la hoja Productos:
  - **Total producto** queda con ancho menor,
  - **Consumidores** queda con ancho mayor,
  - las filas tienen más alto para evitar amontonamiento.


## Nuevo en V2.9

- Las cuentas nuevas ya no vienen con **Carlos** y **Vale** como personas predeterminadas.
- Al ingresar por primera vez, la cuenta parte sin participantes.
- El placeholder del campo de persona ahora dice **Ej: Nombre**.
- Si el navegador ya tenía datos guardados en localStorage, esas cuentas antiguas se conservan tal como estaban.


## Nuevo en V3.0

- Se integró Google AdSense Auto Ads con el editor `pub-4358472434423818`.
- Se agregó la etiqueta `google-adsense-account`.
- Se agregó el script oficial de AdSense con `client="ca-pub-4358472434423818"`.
- Se creó `ads.txt` en la raíz del proyecto.
- Se actualizó la página de privacidad con una sección de publicidad.
- Se ajustó el service worker para no interceptar recursos externos de AdSense.

## Importante sobre AdSense

Esta versión queda lista para Auto Ads. Para que los anuncios aparezcan en producción:

1. El sitio debe estar publicado en Vercel con HTTPS.
2. La cuenta/sitio debe estar aprobado en Google AdSense.
3. Auto Ads debe estar activado en AdSense para el dominio.
4. Si quieres anuncios manuales en lugares específicos, debes crear unidades de anuncio en AdSense y reemplazar/insertar sus `data-ad-slot`.


## Nuevo en V4.0 - Cuentas del hogar

- Se agregó un tercer modo de cuenta: **Hogar**.
- Permite registrar gastos domésticos mensuales.
- Incluye mes de la cuenta del hogar.
- Permite agregar vencimiento por gasto.
- Permite marcar gastos recurrentes.
- Agrega categorías domésticas: Arriendo, Luz, Agua, Gas, Internet, Gastos comunes, Supermercado, Streaming, Transporte y Otros.
- Agrega resumen doméstico con gastos recurrentes, próximos vencimientos y gastos vencidos.
- Permite duplicar el mes del hogar usando los gastos recurrentes.
- Ajusta textos de la interfaz: en modo Hogar se habla de gastos y participantes, no de productos y consumidores.
- El enlace compartible y el Excel incluyen datos del modo Hogar.


## Nuevo en V4.1

- Se corrigió la vista móvil para que la app use todo el ancho disponible del celular.
- Se ajustó el header móvil para que los botones no dejen un espacio vacío a la derecha.
- Se reforzó el diseño responsive de tarjetas, secciones, acciones y barra inferior.
- Las cuentas nuevas ya no traen Carlos/Vale como personas predeterminadas.
- Se agregó una migración segura: si existe una cuenta inicial vacía llamada "Nueva cuenta" con solo Carlos y Vale, se limpia automáticamente.


## Nuevo en V4.2

- Se corrigió la edición del nombre de cuenta:
  - puedes borrar el nombre completo sin que se reemplace inmediatamente por "Cuenta sin nombre";
  - si sales del campo vacío, vuelve a "Nueva cuenta".
- Se agregó tipo de división **Responsables de pago**.
  - Útil para plataformas o gastos donde una persona paga varias partes.
  - Ejemplo: Wladimir 2 partes, Carlos 2 partes, Pamela 1 parte.
- En modo **Hogar**:
  - se oculta la sección Propina;
  - la propina se fuerza a 0;
  - el resumen compartido no muestra propina.
- Se quitó la caja lateral de versión/descripción.
- Se mantiene la corrección móvil y la limpieza de Carlos/Vale predeterminados.


## Nuevo en V4.3

- Se corrigió la lógica de **Responsables de pago**.
- En modo Responsables, las personas ya no vienen todas seleccionadas por defecto.
- Ahora debes seleccionar solo quién paga y asignar cuántas partes asume.
- Ejemplo Spotify:
  - Wladimir: 2 partes
  - Carlos: 2 partes
  - Pamela: 1 parte
- Se corrigió un error potencial en la lista de productos/gastos donde el texto de "Responsables/Participantes/Consumidores" podía fallar.
- Se guarda `splitMode` en cada producto/gasto para que el cálculo y el historial sean consistentes.


## Nuevo en V4.4

- Se agregó teléfono opcional a las personas.
- El teléfono se normaliza para WhatsApp.
  - Ejemplo Chile: 912345678 se transforma internamente en 56912345678.
- Se agregó botón WhatsApp en cada persona.
- Se agregó botón WhatsApp en el resumen por persona.
- El mensaje personal incluye:
  - nombre de la cuenta,
  - monto a pagar,
  - pagador principal si corresponde,
  - mes si es cuenta de hogar.
- Los teléfonos también se guardan en enlaces compartibles.


## Nuevo en V4.5

- Se mejoró el Excel para que las columnas se ajusten mejor al contenido real.
- Se evita que columnas como **Total producto** queden innecesariamente grandes.
- Las columnas con texto largo, como **Consumidores / Responsables**, tienen más espacio sin ocupar demasiado.
- Se ignoran los títulos grandes combinados al calcular el ancho automático, para que no deformen la hoja.
- Se ajustaron altos de filas en Productos para que no se vean exagerados.


## Nuevo en V5.0 - Usuarios y modo invitado

- Se agregó botón **Ingresar / Mi cuenta**.
- Se agregó **modo invitado**, manteniendo la experiencia actual.
- Se agregó creación de usuarios locales.
- Se agregó inicio de sesión local.
- Se agregó cierre de sesión.
- Cada usuario local tiene su propio espacio de cuentas en este navegador.
- Al crear cuenta, se puede migrar la información del modo invitado al usuario.
- La contraseña se guarda con hash local cuando el navegador permite Web Crypto.
- La página de privacidad aclara que esta versión no sincroniza en la nube.

### Importante

Esta versión implementa usuarios locales en el navegador. Sirve para separar cuentas y preparar la app.
Para sincronización real entre dispositivos se necesita una base de datos externa, por ejemplo Supabase.


## Nuevo en V5.1

- Se corrigió el botón **Exportar Excel**:
  - el `id` había quedado como `exportExcel ajustableButton`;
  - eso hacía que `dom.exportExcelButton` fuera `null`;
  - el error detenía parte del JavaScript y por eso podían fallar Importar/Exportar respaldo.
- Se reforzó el listener de Exportar Excel para que no rompa el resto de la app si falta el botón.
- Se mejoró el respaldo en modo usuarios:
  - el JSON ahora incluye información del perfil activo;
  - el respaldo se exporta con nombre de perfil/invitado;
  - al importar, se aclara si reemplazará el modo invitado o el usuario activo.
- Se mantiene compatibilidad con respaldos anteriores.


## Nuevo en V6.0 - Agregar desde boleta

- Se agregó botón **Agregar desde boleta**.
- Permite subir o tomar foto de una boleta.
- Usa OCR en el navegador con Tesseract.js.
- Detecta posibles productos y montos.
- Muestra una tabla editable antes de agregar: usar/no usar, producto, monto y categoría.
- Intenta ignorar líneas como total, subtotal, propina, IVA, tarjeta, efectivo y vuelto.
- Los productos seleccionados se agregan a la cuenta actual.
- En modo Detallada se agregan inicialmente divididos entre todas las personas.
- En modo Hogar se agregan como gastos de responsables para que puedas asignar quién paga después.

Importante: la lectura automática puede tener errores. Revisa siempre antes de agregar.


## Nuevo en V6.1 - OCR mejorado

- Se agregó preprocesamiento de imagen antes del OCR:
  - escala mayor,
  - blanco y negro,
  - contraste alto.
- Se mejoró la detección de boletas con columnas:
  - producto + cantidad + precio,
  - producto + precio,
  - producto en una línea y monto en la siguiente.
- Se agregó área **Texto leído**:
  - muestra el texto detectado por OCR,
  - permite editarlo manualmente,
  - permite presionar **Volver a detectar**.
- Se mejoraron filtros para ignorar:
  - subtotales,
  - total,
  - propina,
  - exento,
  - mesa,
  - cubiertos,
  - datos de pago.
- Se agregó ayuda visual con consejos para tomar mejores fotos de boletas.


## Nuevo en V6.2 - Corrección boleta

- Se corrigió un error de V6.1: el JavaScript esperaba `receiptRawTextInput` y `reparseReceiptTextButton`, pero esos elementos no habían quedado insertados en el HTML.
- Ese error podía detener la carga de la app.
- Se agregó el panel **Texto leído** correctamente.
- Se agregó el botón **Volver a detectar** correctamente.
- Se reforzó el listener para que, si faltara un elemento, no se rompa toda la app.
- Escape ahora también cierra el modal de boleta.


## Nuevo en V6.3 - Detección de productos reforzada

- Se mejoró el parser de boletas para detectar productos que el OCR deja separados por columnas.
- Ahora intenta reconocer:
  - producto + cantidad + precio en una misma línea;
  - producto + precio;
  - producto en una línea y cantidad/precio en la siguiente;
  - varios nombres de productos seguidos, luego cantidades y luego precios.
- Esto mejora casos como boletas de restaurante donde el OCR lee:
  - VIAN ITALIANA
  - VIAN VEG ITALIANA
  - 2.00
  - 1.00
  - 8,180
  - 4,390
- Se mantienen filtros para evitar tomar subtotales, totales y propinas como productos.


## Nuevo en V7.0 - Supabase experimental

- Se integró Supabase Auth real.
- El modo invitado sigue funcionando con localStorage.
- El modo usuario usa Supabase para iniciar sesión y sincronizar el estado completo de Cuenta Clara.
- Se agregó `supabase-config.js`.
- Se agregó `sql/01-supabase-app-state.sql`.
- Se usa una tabla nueva `app_states` para guardar el estado completo por usuario.
- Al crear cuenta puedes migrar tus cuentas de invitado a Supabase.
- Al iniciar sesión, la app carga el estado guardado en Supabase.
- Al editar la app, los cambios se guardan localmente y se sincronizan con Supabase.

## Paso obligatorio antes de probar V7.0

Ejecuta el archivo `sql/01-supabase-app-state.sql` en Supabase:

1. Supabase → SQL Editor.
2. New query.
3. Pega el contenido de `sql/01-supabase-app-state.sql`.
4. Run.

Luego sube la app a Vercel o pruébala con Live Server.


## Nuevo en V7.1 - Fix Supabase

- Se corrigió un error de V7.0 que impedía que la app inicializara correctamente.
- Faltaban funciones internas de Supabase como `initializeAuthSession`, `hasSupabaseClient`, `setUserSession`, `saveAuthSession`, `loadCloudState` y `saveCloudStateNow`.
- Se eliminó el bloque heredado de usuarios locales que generaba conflictos.
- Se protegieron listeners de autenticación para que no rompan la carga si falta algún elemento.
- La app vuelve a responder a los botones y mantiene:
  - modo invitado,
  - login Supabase,
  - sincronización con `app_states`.


## Nuevo en V7.2 - Corrección de inicio

- Se corrigió el error `Uncaught ReferenceError: async is not defined`.
- Se eliminó una línea `async` suelta que impedía que el JavaScript terminara de cargar.
- Se agregó captura de error al inicio para mostrar un aviso si la app no logra inicializar.


## Nuevo en V7.3 - Limpieza de caché y service worker

- Se agregaron versiones en `styles.css`, `script.js` y `supabase-config.js`.
- Se reemplazó el service worker por una versión network-first.
- El service worker elimina cachés antiguas al activarse.
- Se agregó un mensaje de consola: `Cuenta Clara V7.3 cargada`.
- Esto ayuda a evitar que el navegador siga usando scripts antiguos.


## Nuevo en V7.4 - Perfil de usuario y estadísticas

- Se agregó sección **Mi perfil** para usuarios con Supabase.
- El usuario puede editar:
  - nick visible,
  - nombre,
  - teléfono opcional,
  - moneda,
  - preferencia visual.
- El perfil se guarda en el estado sincronizado con Supabase.
- Se actualiza metadata básica del usuario en Supabase cuando se guarda el perfil.
- Se agregaron estadísticas de uso:
  - cuentas creadas,
  - cuentas activas,
  - total histórico dividido,
  - promedio por cuenta,
  - personas agregadas,
  - productos/gastos registrados,
  - cuentas del hogar,
  - salidas/rápidas,
  - categorías más usadas,
  - personas frecuentes,
  - última actividad.
- Se agregó botón **Sincronizar ahora**.


## Nuevo en V8.0 - Perfil navegable y amigos

- Se agregó una nueva página `perfil.html`.
- El perfil ahora se puede navegar por secciones:
  - Perfil
  - Estadísticas
  - Amigos
  - Configuración
- Se agregó foto de perfil.
- Se agregó lista de amigos frecuentes.
- Se puede agregar, editar y eliminar amigos.
- Cada amigo puede tener nombre, teléfono, correo y notas.
- En la app principal se agregó **Agregar desde amigos**.
- Los amigos seleccionados se agregan como participantes de la cuenta actual.
- Perfil, foto y amigos se guardan dentro del estado sincronizado con Supabase.
- Se agregó `profile.js` para que la página de perfil funcione separada de la app principal.


## Nuevo en V8.1 - Amigos entre usuarios

- El indicador **Nube: usuario** ahora funciona como acceso directo al perfil.
- Se quitó el botón separado **Perfil** de la cabecera principal.
- Se agregó búsqueda de usuarios registrados desde `perfil.html`.
- Se agregaron solicitudes de amistad entre usuarios:
  - enviar solicitud,
  - ver solicitudes recibidas,
  - aceptar/rechazar,
  - ver solicitudes enviadas,
  - ver amigos registrados.
- En la app principal, **Agregar desde amigos** ahora muestra:
  - amigos manuales,
  - amigos registrados aceptados.
- Se agregó `sql/02-supabase-social.sql`.

## Paso obligatorio para V8.1

Antes de usar amigos entre usuarios, ejecuta `sql/02-supabase-social.sql` en Supabase → SQL Editor.


## Nuevo en V8.2 - Ajuste móvil

- Se corrigió el ancho en celulares para evitar el margen vacío a la derecha.
- Se reforzó el ancho de header, contenedores, tarjetas y barra inferior.
- Se ajustó la grilla de botones superiores en pantallas pequeñas.
- Se versionaron recursos con `v=8.2` para evitar caché del navegador.


## Nuevo en V8.3 - Experiencia guiada

- Se agregó una pantalla inicial: "¿Qué quieres hacer hoy?"
  - Dividir una salida
  - Cuentas del hogar
  - Cuenta rápida
- Se agregó una tarjeta de progreso:
  - Personas
  - Productos
  - Revisar
  - Compartir
- Se agregó botón inteligente "Siguiente paso".
- Se agregó vista Simple / Avanzada.
- En vista Simple se ocultan acciones avanzadas para reducir ruido visual.
- Se agregaron tarjetas para elegir cómo agregar un producto:
  - Escribir
  - Escanear boleta
  - Productos rápidos
- Se mejoró el texto de "Responsables de pago" con explicación clara.
- No requiere SQL nuevo.


## Nuevo en V8.4 - Corrección experiencia guiada

- Se corrigió el error al iniciar:
  - `Cannot read properties of undefined (reading 'people')`.
- La experiencia guiada ahora espera a que exista una cuenta activa antes de calcular pasos.
- `getActiveBill()` ahora es más tolerante si el estado viene vacío o incompleto.
- Se agregó protección para que la experiencia guiada no bloquee la app si falla.
- No requiere SQL nuevo.


## Nuevo en V8.5 - Pulido de perfil y sincronización automática

- Se corrigió el modo oscuro en `perfil.html`.
- El acceso de sesión ahora muestra solo el nick/nombre, por ejemplo `Carloco`, sin el prefijo `Nube:`.
- El botón `Mi cuenta` ya no aparece cuando el usuario está conectado.
- El nombre/nick de sesión sigue funcionando como acceso directo al perfil.
- La sincronización con Supabase queda casi inmediata después de cada cambio.
- Se agregó estado discreto de guardado:
  - Guardando...
  - Guardado en la nube
  - Guardado local
- `Sincronizar` se renombró como `Guardar ahora`.
- No requiere SQL nuevo.


## Nuevo en V8.6 - Ajuste visual de estadísticas

- Se corrigió la visualización de **Categorías más usadas**.
- Se corrigió la visualización de **Personas frecuentes**.
- Ahora los nombres y montos/frecuencias aparecen separados y ordenados.
- Se corrigió el plural: `2 veces` en vez de `2 vezes`.
- No requiere SQL nuevo.




## Nuevo en V8.9 - Menos ruido visual y perfil por secciones

- Historial / Tus cuentas queda arriba del resumen Por persona / Pagos en la barra lateral.
- Propina queda dentro de Editar cuenta, por lo que se oculta junto con la configuración avanzada.
- La página Perfil funciona por secciones: Perfil, Estadísticas, Amigos y Configuración muestran solo su contenido activo.
- Se mantiene la lógica de Supabase, perfiles públicos, amigos, exportaciones y cálculos de V8.8.

## Nuevo en V8.8 - Interfaz más limpia

- Se movió el resumen **Por persona / Pagos** a la barra lateral izquierda, con comportamiento sticky en escritorio.
- Se incorporó el total final en la barra lateral para revisar montos mientras se agregan productos.
- La configuración de cuenta ahora queda resumida en **Editar cuenta**: tipo de cuenta, pagador principal, personas y propina.
- Al seleccionar un pagador principal, la configuración se oculta automáticamente y se puede volver a abrir desde **Editar cuenta**.
- El indicador de sincronización ahora es más discreto: usa texto tipo **Sincronizado 02:14**.

## Nuevo en V8.7 - Sincronización de perfil público

- Se corrigió la actualización de `public_profiles`.
- Al crear usuario desde la app principal, ahora también se guarda el perfil público.
- Al iniciar sesión, la app verifica y actualiza `public_profiles`.
- Al guardar cambios de perfil o foto, también se actualiza la búsqueda pública.
- Se actualizó `sql/02-supabase-social.sql`:
  - crea/actualiza `public_profiles`;
  - crea trigger automático para nuevos usuarios;
  - mantiene políticas RLS;
  - mantiene solicitudes de amistad.
- Requiere ejecutar nuevamente `sql/02-supabase-social.sql` en Supabase.