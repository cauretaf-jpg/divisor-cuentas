# Cuenta Clara V2.8

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
