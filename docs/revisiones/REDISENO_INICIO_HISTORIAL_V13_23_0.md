# Cuenta Clara — Rediseño de Inicio e Historial, v13.23.0
Fecha: 18 de octubre de 2026

## Propósito
Primera etapa visual y de navegación de la futura v14: llevar el estilo de la propuesta ilustrada a la app real, manteniendo la versión pública inalterada mientras se validan los cambios. Rama de desarrollo: `feature/asistente-contextual-propinas-2026-10`. Pull request #1 permanece como borrador.

## Cambios en Inicio
- La creación tiene prioridad con la pregunta «¿Qué quieres dividir hoy?», con atajos Bar, Restaurante, Supermercado y Hogar. Cada atajo selecciona su plantilla, abre el asistente y comienza en el paso del nombre; «Atrás» permite cambiar el contexto.
- «Ver todos los tipos» abre el primer paso del asistente.
- «Historial reciente» está inmediatamente debajo de la creación, no escondido tras el resto de los controles.
- Estadísticas del conjunto de cuentas: total guardadas, pendientes con monto mayor a cero y compartidas. La cuenta inicial vacía no se cuenta como gasto real.
- Las cifras de la cuenta seleccionada se distinguen visualmente de las estadísticas globales.
- El encabezado mantiene estado de sincronización discreto.
- Todos los botones de nueva cuenta y primera cuenta abren el asistente guiado existente, sin crear rutas paralelas.
- Mantiene pagos, resumen, invitaciones, cuentas recurrentes, accesos y modo invitado.

## Cambios en Historial
- Título «Historial de cuentas», CTA «Nueva cuenta» y resumen de guardadas/pendientes/pagadas.
- Se muestran **todas las cuentas por defecto**, incluidas archivadas y cerradas (sin perder filtros existentes).
- Filtros rápidos «Todas / Pendientes / Pagadas» sincronizados con el selector de estado, con `aria-pressed`.
- Contador «n de total cuentas» y búsqueda, filtros de tipo y ordenamiento conservados.
- Al seleccionar una cuenta desde el historial o las recientes, se abre su **Resumen** y se conserva la cuenta activa.
- Tarjetas compactas y botones de edición, pagos, cerrar/reabrir y eliminar; eliminación con menor peso visual pero funcionalidad intacta.
- Estados vacíos con mensajes orientativos.

## Estilos y accesibilidad
- Diseño mobile-first con hero en azul profundo y acentos menta, tarjetas compactas, foco visible, compatibilidad con variables de modo oscuro y preferencia de movimiento reducido.
- Diseño fluido a 420, 760 píxeles y escritorio.
- Versión de JS y recursos 13.23.0; se invalida caché de service worker.
- No se agregaron bibliotecas, imágenes externas, claves ni tablas.

## Revisión de estabilidad
- `node --check` en JS de la aplicación, perfil, utilidades y service worker.
- Pruebas de cálculo, propina y conciliación de boletas de v13.22 conservadas.
- Pruebas de HTML/JS para existencia única de nuevos IDs, botones de plantillas, filtros, accesibilidad básica y navegación.
- Pruebas puras de conteo de cuentas, incluyendo pendientes sin monto y primer uso.
- GitHub Actions del commit de corrección: exitoso. Despliegue de preview sujeto a comprobación final de Vercel.
- Las cuatro migraciones de Supabase se aplicaron antes de esta etapa; **no se ejecutó SQL nuevo** durante el rediseño de Inicio/Historial.

## Importante: pendientes antes de producción
1. Pruebas visuales manuales en Android, escritorio y modo oscuro, tanto con estado vacío como con cuentas existentes.
2. Pruebas con al menos dos usuarios en Supabase: inicio de sesión, borradores, invitaciones aceptadas/rechazadas, permisos de edición, roles, sincronización y pagos.
3. Confirmar navegación del historial, boletas, perfil, WhatsApp y PWA bajo cuenta real.
4. Revisión de accesibilidad con lector de pantalla.
5. Completar etapas restantes de la v14: nuevo flujo de pagadores múltiples, división mixta, refinamiento de Personas/Gastos/Pagos/Mi Perfil, OCR integrado al asistente.

Sin pruebas E2E reales, no se declara la nueva versión plenamente operativa ni se fusiona el PR.
