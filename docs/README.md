# Cuenta Clara V13.6

## Onboarding y plantillas inteligentes

Esta version mantiene la limpieza tecnica previa y suma un flujo guiado para nuevos usuarios. El foco es que una persona nueva entienda mas rapido que tipo de cuenta debe crear y que la app entregue ayuda contextual segun la plantilla elegida.

## Cambios principales

- Se agrego un panel de asistente de plantillas en Inicio.
- La app ahora sugiere una plantilla inicial segun el contexto de uso:
  - cuenta activa vacia;
  - modo de cuenta actual;
  - plantillas usadas recientemente;
  - horario del dia como fallback.
- Las plantillas ahora tienen descripcion, checklist, ejemplos y ayuda especifica.
- Al tocar una plantilla en Inicio, primero se muestra una vista previa antes de crear la cuenta.
- Se agrego una tarjeta de ayuda de plantilla activa en Gastos.
- Los ejemplos de plantilla pueden preparar el formulario de gasto sin agregar montos automaticamente.
- Se corrigio un texto duplicado en la tarjeta de cuenta actual.
- Se actualizo el cache del service worker a `cuenta-clara-v13.6`.

## Plantillas reforzadas

- Restaurante.
- Supermercado.
- Streaming.
- Viaje.
- Hogar.
- Cuenta rapida.
- Personalizada.

Cada plantilla define:

- tipo de cuenta;
- propina inicial;
- nombre sugerido;
- descripcion para usuario nuevo;
- checklist de uso;
- ejemplos de gastos/categorias;
- siguiente accion recomendada.

## Validaciones realizadas

- `shared-utils.js` validado con `node --check`.
- `script.js` validado con `node --check`.
- `profile.js` validado con `node --check`.
- `index.html` revisado sin IDs duplicados.
- `perfil.html` revisado sin IDs duplicados.
- `privacidad.html` revisado sin IDs duplicados.
- `styles.css` revisado con llaves balanceadas.
- Referencias `querySelector('#id')` revisadas contra los HTML principales.
- No requiere SQL nuevo.
- No agrega dependencias nuevas.

## Recomendacion de prueba

Despues de subir a GitHub/Vercel, probar estos flujos:

1. Inicio > revisar plantilla sugerida.
2. Inicio > tocar Restaurante, Streaming, Hogar y Cuenta rapida para ver la vista previa.
3. Crear una cuenta desde el asistente.
4. Personas > agregar participantes.
5. Gastos > revisar la tarjeta de plantilla activa.
6. Tocar ejemplos de plantilla y confirmar que preparan el formulario sin crear gastos automaticamente.
7. Probar OCR/boleta para confirmar que el flujo sigue funcionando.
8. Resumen > Antes de compartir.
9. Pagos > Centro financiero.
10. Perfil > dashboard financiero.

Si el navegador mantiene una version anterior, cerrar la app, limpiar cache del sitio o abrir una ventana privada para confirmar que cargue V13.6.
