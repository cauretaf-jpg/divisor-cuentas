# Cuenta Clara V13.5

## Limpieza tecnica y estabilidad

Esta version no agrega funciones grandes nuevas. Su objetivo es ordenar la base de la app antes de seguir creciendo con nuevas caracteristicas.

## Cambios principales

- Se agrego `shared-utils.js` como archivo comun de utilidades.
- Se centralizaron funciones repetidas entre `script.js` y `profile.js`:
  - formato de moneda;
  - fechas ISO;
  - telefonos;
  - iniciales;
  - almacenamiento por usuario;
  - perfil base;
  - amigos;
  - escape HTML;
  - etiquetas de tipo de cuenta;
  - modo claro/oscuro.
- Se conecto el boton **Aplicar plantilla** con la funcion `changeActiveBillTemplate()`.
- Se eliminaron referencias antiguas a `accountSettingsPanel`, `accountSettingsSummaryText` y `receiptButton`.
- Se reemplazo un mensaje tecnico relacionado con SQL por un mensaje profesional para usuario final.
- Se eliminaron reglas CSS de componentes antiguos sin uso actual.
- Se actualizo el cache del service worker a `cuenta-clara-v13.5`.
- Se agrego `shared-utils.js` al service worker.

## Validaciones realizadas

- `shared-utils.js` validado con `node --check`.
- `script.js` validado con `node --check`.
- `profile.js` validado con `node --check`.
- `index.html` revisado sin IDs duplicados.
- `perfil.html` revisado sin IDs duplicados.
- `privacidad.html` revisado sin IDs duplicados.
- `styles.css` revisado con llaves balanceadas.
- No requiere SQL nuevo.
- No agrega dependencias nuevas.

## Recomendacion de prueba

Despues de subir a GitHub/Vercel, probar estos flujos:

1. Abrir Inicio y cambiar entre secciones moviles.
2. Crear o abrir una cuenta existente.
3. Probar el selector de plantilla y el boton **Aplicar plantilla**.
4. Agregar una persona y un gasto manual.
5. Usar OCR de boleta y confirmar que el flujo sigue funcionando.
6. Revisar Resumen > Antes de compartir.
7. Revisar Pagos > Centro financiero.
8. Abrir Perfil y revisar dashboard financiero.

Si el navegador mantiene una version anterior, cerrar la app, limpiar cache del sitio o abrir una ventana privada para confirmar que cargue V13.5.
