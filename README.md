# Cuenta Clara V6.1

App web funcional para dividir cuentas entre varias personas.

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
