# Cuenta Clara V13.7

Version enfocada en recurrentes con deuda acumulada.

## Cambios principales

- Crear siguiente mes desde una carpeta recurrente.
- Arrastre de deudas pendientes al nuevo mes.
- Opcion para mantener deuda anterior visible pero separada del total.
- Opcion para marcar deuda anterior como pagada antes de crear el nuevo mes.
- Opcion para ignorar deuda anterior en ese ciclo.
- Historial mensual conectado.
- Resumen acumulado por persona.
- Mensajes de WhatsApp con desglose de deuda anterior, mes actual y total acumulado.
- Plantillas recurrentes ampliadas para Streaming y Hogar.

## Compatibilidad

- No requiere SQL nuevo.
- No agrega dependencias nuevas.
- Mantiene compatibilidad con respaldos de versiones anteriores.

## Archivos principales

- `index.html`
- `styles.css`
- `shared-utils.js`
- `script.js`
- `profile.js`
- `service-worker.js`

## Recomendacion de prueba

Probar especialmente:

1. Crear cuenta Streaming.
2. Agregar personas y gastos recurrentes.
3. Marcar una persona como pendiente.
4. Crear carpeta recurrente.
5. Crear siguiente mes usando cada opcion de deuda.
6. Revisar Pagos, Hogar, Resumen y WhatsApp.
