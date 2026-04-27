# Cuenta Clara V1.2

App web funcional para dividir cuentas entre varias personas.

## Funciones principales

- Crear varias cuentas.
- Cambiar entre cuentas guardadas.
- Duplicar y eliminar cuentas.
- Editar nombre de cuenta.
- Agregar y eliminar personas.
- Renombrar persona con doble clic sobre su nombre.
- Marcar personas como pagado o pendiente.
- Agregar productos con precio unitario y cantidad.
- Dividir productos entre una o varias personas.
- Asignar partes distintas por persona.
- Editar y eliminar productos.
- Calcular subtotal, propina, total final, pagado y pendiente.
- Guardado local en localStorage.
- Modo oscuro.
- Diseño responsive.
- Manifest y service worker básico para PWA.

## Nuevo en V1.1

Módulo de compartir:

- Compartir como texto.
- Compartir como imagen.
- Elegir entre resumen simple o resumen con detalle.
- Texto compatible con negrita en WhatsApp usando asteriscos.
- Imagen tipo tarjeta/comprobante.
- Descargar imagen PNG.
- Intentar compartir imagen usando el menú nativo del dispositivo.
- WhatsApp con texto directo.
- Para imagen en WhatsApp, se descarga la imagen para adjuntarla manualmente.

## Cómo abrir

Puedes abrir `index.html` directamente en el navegador.

Para probar la PWA y el service worker, usa un servidor local, por ejemplo la extensión Live Server de Visual Studio Code.

## Importante

Esta Versión 1.1 funciona sin login y sin base de datos externa.
Los datos quedan guardados solo en el navegador donde se usa la app.


## Nuevo en V1.2

- Al intentar agregar una persona con un nombre repetido, aparece una pestaña/aviso visible.
- En la opción de imagen + WhatsApp, la app intenta primero compartir la imagen con el menú nativo del dispositivo.
- Si el navegador no permite enviar imagen directo a WhatsApp, la app:
  1. intenta copiar la imagen al portapapeles,
  2. descarga el PNG,
  3. abre WhatsApp con un mensaje base,
  4. muestra instrucciones para pegar o adjuntar la imagen.

Nota técnica: WhatsApp Web no permite adjuntar automáticamente una imagen mediante enlaces `wa.me`. Por seguridad del navegador, el usuario debe pegar la imagen o adjuntar el archivo descargado si el menú nativo no está disponible.
