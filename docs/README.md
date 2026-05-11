# Cuenta Clara V13.11.2

Version enfocada en pruebas reales, experiencia guiada y uso diario. Mantiene la base estable de V13.10 y agrega mejoras pequeñas para probar la app con casos reales sin tocar base de datos.

## Cambios principales

- Flujo de primer uso reforzado con progreso `Paso 1 de 5`.
- Inicio con nueva tarjeta `Modo demo`.
- Datos demo completos para probar:
  - restaurante con propina;
  - streaming mensual con arrastre anterior;
  - hogar con vencimientos y pagos pendientes.
- Boton para borrar los datos demo sin eliminar cuentas reales.
- OCR mas comodo para revisar boletas:
  - ajustar manualmente el total de la boleta;
  - seleccionar solo productos validos;
  - saltar rapidamente al primer producto que requiere revision;
  - ayuda contextual segun diferencia, productos en $0 o seleccion pendiente.
- Centro financiero con filtros adicionales:
  - Me deben;
  - Yo debo;
  - Atrasadas o por vencer;
  - Arrastre anterior.
- Progreso guiado actualizado a 5 pasos: Crear, Personas, Gastos, Revisar y Compartir.
- Service worker actualizado a `cuenta-clara-v13.11.2`.

## Compatibilidad

- No requiere SQL nuevo.
- No agrega dependencias nuevas.
- Mantiene respaldos, diagnostico, perfil financiero, OCR, recurrentes, compartidas y permisos.
- Los datos demo se agregan como cuentas simuladas y pueden eliminarse desde Inicio.

## Archivos principales modificados

- `index.html`
- `styles.css`
- `script.js`
- `profile.js`
- `service-worker.js`
- `docs/README.md`
- `docs/LEEME_PRIMERO.txt`

## Pruebas recomendadas

1. Abrir Inicio y cargar `Modo demo`.
2. Revisar que aparezcan las cuentas Demo: Restaurante, Streaming y Hogar.
3. Abrir Pagos y probar filtros: Me deben, Yo debo, Atrasadas o por vencer y Arrastre anterior.
4. Abrir Gastos, usar Escanear boleta y probar: ajustar total, usar solo validos y ver productos a revisar.
5. Borrar datos demo desde Inicio y confirmar que las cuentas reales se mantienen.
6. Probar flujo normal: crear cuenta, agregar personas, gastos, resumen y compartir.
7. Revisar en celular que Inicio, Pagos y OCR sean comodos.

