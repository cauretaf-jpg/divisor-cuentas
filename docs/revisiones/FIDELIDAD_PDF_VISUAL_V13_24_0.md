# Cuenta Clara — Ajuste visual fiel al PDF · v13.24.0

Fecha: 18 de octubre de 2026.
Referencia de diseño: `Cuenta_Clara_Propuesta_Asistente_Guiado_Octubre_2026.pdf`, con mockups móviles del asistente y un mockup de escritorio.

## Qué se corrigió respecto a v13.23.0

La implementación anterior reutilizaba demasiados estilos del panel antiguo: degradado azul, tarjetas densas, botones visualmente inconsistentes, listado y herramientas con excesivo protagonismo, y asistente en formato de modal genérico. El usuario solicitó fidelidad al PDF.

La versión 13.24 crea un **sistema visual separado en `design-pdf.css`**, cargado al final para anular de forma controlada los estilos anteriores sin borrar funcionalidades.

### Identidad visual copiada de la referencia
- Fondo de aplicación muy claro (papel `#f5f8fa`); tarjetas blancas `#ffffff`.
- Texto principal azul marino `#1c2b42`; secundarios gris azulado `#62748c`.
- Líneas finas `#dbe6ec`, verde turquesa `#0faca0` y fondos menta `#def6ef`.
- Sin degradado en la pregunta principal; tarjetas sobrias sin sombras intensas.
- Tipografía de encabezados grande y jerarquizada, indicadores secundarios discretos.
- Modo oscuro mediante variables del tema, sin necesidad de nuevos componentes ni bibliotecas.

### Inicio
- «¿Qué quieres dividir hoy?» sobre fondo blanco, con categorías en tarjetas bordeadas e iconos sobre fondo menta.
- Historial reciente y métricas destacados, sin saturación.
- Se reordenaron acciones secundarias en `<details id="ccHomeAdvanced">`; siguen funcionales, pero la interfaz principal permanece limpia. El panel de solicitudes de amigos sigue **fuera** del desplegable, para que no se oculte.
- Se mantuvieron datos, notificaciones, cuenta seleccionada, acciones de gastos, pagos y acceso a herramientas.

### Historial
- Tarjetas blancas con bordes finos, menos elementos cromáticos, filtros sencillos y botones más sobrios.
- Se conservan búsqueda, estado, tipo, orden, abrir en resumen, editar gastos, pagos, cerrar/reabrir, borrar y exportación de respaldo.
- Sigue abierto por defecto en móvil, sin sección colapsada.

### Asistente móvil y escritorio
- Cabecera con logo centrado, flecha para volver, cierre independiente.
- Barra de progreso de cinco **segmentos turquesa**, en vez del antiguo selector de pasos numerados.
- Opción seleccionada con borde turquesa y marca de confirmación; tarjetas limpias, iconos menta.
- Botón «Continuar» de ancho completo y fijo abajo en pantalla móvil.
- Escritorio con barra lateral azul marino y lista de las cinco etapas.
- Funcionalidad de plantillas, participantes, productos, propina y conciliación se mantiene en el motor ya existente.

### Archivos alterados
- `app.html`: estructura de nuevo asistente, navegación y panel secundario desplegable.
- `script.js`: cabeceras, progreso y retorno del asistente, manteniendo las funciones de negocio.
- `design-pdf.css`: nueva capa de diseño, aislada para facilitar futuras correcciones.
- `service-worker.js`: precaché de la nueva hoja de estilos e invalidación de versión `v13.24.0`.
- `index.html` y `perfil.html`: actualización de versión en recursos.
- `tests/validar-asistente.js` y `tests/smoke-ui.cjs`: validación estática, flujo y estilos en Chromium.

## Resultados de prueba
- GitHub Actions y Node: **SUCCESS**.
- Chromium en móvil 390 × 844 y escritorio 1280 × 850: **SUCCESS**.
- Verificado con estilos computados: `cc-pdf-redesign` activo, `design-pdf.css` cargado, cabecera sin gradiente, fondo de tarjetas blanco `rgb(255,255,255)`, texto azul `rgb(28,43,66)` y botón principal turquesa `rgb(15,172,160)`.
- Flujos probados: Inicio → asistente Bar → volver al tipo; búsqueda y filtros de dos cuentas ficticias, apertura a Resumen; ausencia de desborde horizontal en escritorio.
- Capturas automáticas generadas por GitHub Actions:
  https://github.com/cauretaf-jpg/divisor-cuentas/actions/runs/39146915133/artifacts/12143632971

## Publicación y límites
- Cambios **solo en rama** `feature/asistente-contextual-propinas-2026-10`, PR n.º 1 en borrador. No fusionados con `main`.
- La API de Vercel informó anteriormente `402 api-deployments-free-per-day`; se debe revisar al restablecerse la cuota. No se modifica facturación.
- **No se ejecutó SQL ni se tocaron datos de producción** durante esta iteración visual. Cuenta Clara y Party Challenge siguen separados.

## Trabajo aún pendiente para v14
- Revisión visual y de usabilidad por el usuario directamente en una vista previa desplegada.
- QA real de sincronización y permisos con dos cuentas autenticadas.
- Extender el mismo lenguaje visual a Personas, Gastos, Pagos y Mi Perfil.
- Completar pagadores múltiples, división mixta y pruebas de OCR.
- Accesibilidad con lector de pantalla y pruebas físicas Android/iOS.

## Continuidad
Mantener `design-pdf.css` como base de los próximos módulos. Evitar agregar reglas globales de `styles.css` que sobrescriban el diseño sin pasar pruebas visuales en Chromium. Documentar cada versión en README, bitácora y evidencia de QA.
