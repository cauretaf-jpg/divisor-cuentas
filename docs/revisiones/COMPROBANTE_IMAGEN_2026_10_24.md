# Comprobante de Cuenta Clara 2.0 — 24 de octubre de 2026

## Objetivo

Reproducir el estilo minimalista de la imagen de referencia aportada: fondo marfil, tipografía serif negra, divisores finos, montos individuales sobre fondos beige, detalle de productos y propina por persona, resumen de productos y total final destacado.

## Funciones incorporadas

- Resultado visible en `index.html` con diseño de comprobante editorial.
- `simple-core.js`: modelo `receiptDetails(d,r)` basado en los valores reconciliados de `calculate(d)`, con agrupación de productos por nombre/precio, cantidades, distribución individual y propina por persona.
- Productos compartidos identificados como tales. Las cortesías de $0 se incluyen en el detalle global sin atribuir cobros a participantes.
- Participantes enumerados con «y» antes del último nombre.
- `simple-receipt.js`: PNG de alta resolución (2160 píxeles de ancho), generado con Canvas local sin subir consumos a servidores de imágenes.
- Compartir archivo PNG por la hoja nativa del dispositivo cuando está disponible; si el navegador no admite compartir archivos, descargar el comprobante para que el usuario pueda adjuntarlo.
- Opciones adicionales: descarga directa PNG, copiar detalle textual y WhatsApp mediante texto.
- La hoja de estilos `simple.css` adapta el comprobante a móvil y escritorio.
- `service-worker.js` invalida recursos v2.0.1 e incluye el generador de imágenes en la caché.

## Ejemplo comprobado

- Carlos: 2 Austral Calafate, consumo $8.600 + propina $860 = **$9.460**.
- Gyn: 1 Austral Calafate, consumo $4.300 + propina $430 = **$4.730**.
- Daniela: 1 Moscow Mule, consumo $6.900 + propina $690 = **$7.590**.
- Mango Sour (cortesía) x3 = $0; Austral Calafate x3 = $12.900; Moscow Mule x1 = $6.900; propina total $1.980.
- **Total final: $21.780**, verificando que la suma individual y global coincide.

## Validaciones

`tests/simple-core.test.cjs` verifica los montos exactos, agrupación de productos y cortesías. `tests/simple-browser.test.cjs` comprueba en Chromium la descarga PNG, cabecera del archivo válida, anchura 2160 px y representación visual de la cuenta de referencia, además de conservar los flujos anteriores de invitado e historial. GitHub Actions finalizado en SUCCESS sobre el commit de la rama.

## Límites

- **Producción no modificada:** el cambio está en `feature/cuenta-clara-2-calculadora-simple`, PR #2 en borrador.
- La imagen se genera y guarda localmente, sin registro. Compartir directamente una imagen depende de `navigator.share` y compatibilidad de cada dispositivo; se ofrece descarga alternativa.
- Para consumos divididos entre múltiples participantes, el comprobante indica que el producto fue compartido y muestra el subtotal correspondiente a cada persona, sin inventar cantidades individuales.
- La sincronización Supabase opcional permanece separada y todavía requiere pruebas con sesiones reales en dos dispositivos.
- Se recomienda verificar visualmente la vista previa en el celular antes de fusionar.

## Reversión

Basta revertir los cambios de `index.html`, `simple-app.js`, `simple-core.js`, `simple.css`, `service-worker.js` y retirar `simple-receipt.js`. No hay migraciones SQL ni cambios de datos asociados a esta funcionalidad.
