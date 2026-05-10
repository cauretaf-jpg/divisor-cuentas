# Cuenta Clara V13.3

## Nuevo en V13.3

Versión enfocada en pulido móvil, estabilidad visual y control más seguro al leer boletas con OCR.

### Cambios principales

- Actualización general de versión a V13.3 en HTML, scripts, estilos y service worker.
- Inicio móvil más compacto: acciones principales mejor distribuidas, tarjetas menos altas y resumen más fácil de leer.
- Dashboard financiero del perfil más cómodo en celular, con tarjetas de dinero en grilla compacta.
- Flujo OCR más seguro: si el total de productos no coincide con el total de la boleta, la app bloquea el agregado directo.
- Nueva acción explícita “Guardar igual” para aceptar una diferencia OCR bajo revisión manual.
- Botón de diferencia más claro: “Agregar diferencia $X”.
- Estados de sincronización y modo local con textos más profesionales, evitando mensajes técnicos visibles.
- Caché/service worker actualizado a V13.3 para reducir confusiones al subir a Vercel.

### Validaciones realizadas

- `script.js` validado con `node --check`.
- `profile.js` validado con `node --check`.
- `index.html` revisado sin IDs duplicados.
- `perfil.html` revisado sin IDs duplicados.
- Service worker actualizado a `cuenta-clara-v13.3`.
- No requiere SQL nuevo.

### Recomendación de prueba

Después de subir a GitHub/Vercel, abrir la app en celular y revisar:

1. Inicio.
2. Personas.
3. Gastos > Escanear boleta.
4. Perfil > Dashboard.
5. Historial.
6. Pagos.

Si el navegador mantiene una versión anterior, cerrar la app, limpiar caché del sitio o abrir una ventana privada para confirmar que cargue V13.3.
