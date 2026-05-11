# Cuenta Clara V13.10

Version enfocada en respaldo, seguridad minima y diagnostico simple antes de seguir sumando funciones grandes.

## Cambios principales

- Se mantiene la base visual y funcional de v13.9.
- Respaldo exportado con version de app, diagnostico y resumen de datos.
- Nombre de archivo de respaldo ahora incluye `v13.10`.
- Importacion de respaldo mas segura:
  - muestra vista previa antes de reemplazar datos;
  - valida que el archivo contenga cuentas validas;
  - no modifica datos actuales si el archivo es invalido;
  - crea una copia local previa antes de importar.
- Nueva seccion `Respaldo y diagnostico` en Historial.
- Diagnostico simple con:
  - version instalada;
  - modo de uso;
  - cantidad de cuentas;
  - monto pendiente total;
  - estado de sincronizacion;
  - tamano local aproximado;
  - copia previa disponible.
- Boton para copiar diagnostico.
- Boton para restaurar la copia previa creada antes de la ultima importacion.
- Los botones de respaldo quedan disponibles tambien en modo Simple.
- Service worker actualizado a `cuenta-clara-v13.10`.

## Compatibilidad

- No requiere SQL nuevo.
- No agrega dependencias nuevas.
- Mantiene compatibilidad con respaldos anteriores que tengan estructura de estado valida.
- Mantiene las funciones de v13.9: diseno premium, modo simple, navegacion movil, comprobante, perfil financiero, pagos, recurrentes, compartidas y OCR.

## Archivos principales modificados

- `index.html`
- `styles.css`
- `script.js`
- `profile.js`
- `service-worker.js`
- `docs/README.md`
- `docs/LEEME_PRIMERO.txt`

## Recomendacion de prueba

Probar especialmente:

1. Abrir Historial.
2. Revisar la tarjeta `Respaldo y diagnostico`.
3. Exportar respaldo.
4. Abrir el JSON y confirmar que contiene `appVersion: 13.10`.
5. Copiar diagnostico.
6. Importar un respaldo valido y revisar la vista previa.
7. Confirmar que se crea copia previa automatica.
8. Restaurar copia previa.
9. Intentar importar un JSON invalido y confirmar que no reemplaza datos.
10. Revisar modo Simple y confirmar que los respaldos siguen visibles.
11. Probar Inicio, Personas, Gastos, Resumen, Pagos, Historial y Perfil.

