# Cuenta Clara V13.9

Version enfocada en diseño premium, experiencia simple y cierre visual de la app antes de avanzar a una version mayor.

## Cambios principales

- Inicio mas limpio tipo panel financiero.
- Accesos rapidos premium desde Inicio: Personas, Gastos, Resumen y Perfil.
- Navegacion movil inferior mas compacta: Inicio, Gastos, Resumen, Pagos y Perfil.
- Enlace directo a Mi perfil desde el menu superior.
- Comprobante premium con fecha visible, estado, total, personas, pagadas y pendiente.
- Texto de comprobante para WhatsApp reforzado con fecha y estado.
- Mejor jerarquia visual en tarjetas, botones, paneles y estados.
- Microinteracciones suaves en botones, chips, tarjetas y navegacion.
- Modo simple mas enfocado: oculta secciones avanzadas cuando corresponde.
- Pulido responsive para pantallas pequenas.

## Compatibilidad

- No requiere SQL nuevo.
- No agrega dependencias nuevas.
- Mantiene compatibilidad con respaldos de versiones anteriores.
- Mantiene las funciones de v13.8: compartidas, roles, permisos, recurrentes, OCR, pagos, perfil financiero e historial.

## Archivos principales

- `index.html`
- `styles.css`
- `shared-utils.js`
- `script.js`
- `profile.js`
- `service-worker.js`

## Recomendacion de prueba

Probar especialmente:

1. Abrir Inicio en escritorio y celular.
2. Cambiar entre modo Simple y Avanzado.
3. Usar la navegacion inferior movil.
4. Crear una cuenta guiada.
5. Agregar personas y gastos.
6. Revisar Resumen y comprobante premium.
7. Copiar comprobante y enviar por WhatsApp.
8. Entrar a Pagos y marcar una persona como pagada.
9. Entrar a Perfil desde la navegacion movil y desde el menu superior.
10. Revisar modo oscuro.
