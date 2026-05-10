# Cuenta Clara V13.4

## Nuevo en V13.4

Versión enfocada en claridad financiera, pagos pendientes y revisión previa antes de compartir una cuenta.

### Cambios principales

- Actualización general de versión a V13.4 en HTML, scripts, estilos y service worker.
- Nuevo panel **Pendiente ahora** en Inicio: muestra pagos/cobros pendientes, urgencias y revisiones críticas de la cuenta activa.
- Nuevo **Centro financiero** dentro de Pagos: permite revisar la cuenta actual, todas las cuentas o solo las vinculadas al perfil.
- Acciones rápidas por deuda: **Ver cuenta**, **Copiar mensaje**, **WhatsApp** y **Marcar pagado**.
- Perfil financiero más accionable: las secciones “A quién le debo” y “Quién me debe” ahora permiten operar directamente sobre cada deuda.
- Nueva revisión previa **Antes de compartir** en Resumen: detecta datos faltantes o riesgos de error antes de enviar el comprobante.
- CSS responsivo para que los nuevos paneles se vean bien en celular.
- Caché/service worker actualizado a `cuenta-clara-v13.4`.

### Validaciones realizadas

- `script.js` validado con `node --check`.
- `profile.js` validado con `node --check`.
- `index.html` revisado sin IDs duplicados.
- `perfil.html` revisado sin IDs duplicados.
- No requiere SQL nuevo.
- No agrega dependencias nuevas.

### Recomendación de prueba

Después de subir a GitHub/Vercel, revisar estos flujos:

1. Inicio > Pendiente ahora.
2. Resumen > Antes de compartir.
3. Pagos > Centro financiero.
4. Perfil > Estadísticas > A quién le debo / Quién me debe.
5. Marcar pagado desde Pagos y confirmar que el Inicio/Perfil se actualicen.
6. Enviar/copiar recordatorio por WhatsApp desde el Centro financiero.

Si el navegador mantiene una versión anterior, cerrar la app, limpiar caché del sitio o abrir una ventana privada para confirmar que cargue V13.4.
