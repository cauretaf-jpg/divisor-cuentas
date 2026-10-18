# Cuenta Clara 2.0 — calculadora simple (octubre de 2026)

## Objetivo y experiencia
La experiencia principal es Inicio → Calculadora → Resultado, sin registro obligatorio. Las opciones Bar, Restaurante, Supermercado y Otro ofrecen productos sugeridos y no inventan montos.

## Funcionalidad implementada
División de monto total igualitaria o personalizada; productos con precio, cantidad y consumidores; propina opcional con reparto proporcional, igualitario, personalizado y exenciones; uno o varios pagadores, o sin datos de pagos; conciliación manual con subtotal de boleta; resumen individual y transferencias; compartir/copiar; historial local automático y borrador. Registro opcional para sincronizar.

## Arquitectura
- index.html: inicio, calculadora y resultado, con modales opcionales de historial y acceso.
- simple-core.js: cálculos puros de CLP, redondeos y deudas.
- simple-app.js: UI, historial local, compartir y sincronización.
- simple.css: interfaz mobile-first independiente de estilos antiguos.
- app.html?advanced=1 conserva la aplicación avanzada. app.html#shared mantiene su ruta de invitaciones.
- sql/09-simple-calculations-2026-10.sql agrega tabla aislada de app_states con RLS y políticas propias.
- manifest.json y service-worker.js mantienen el inicio de la PWA en la calculadora.

## Persistencia, seguridad y migración
Las cuentas se guardan localmente al pulsar Ver resultado y pueden perderse si se borra el almacenamiento del navegador. Al iniciar sesión con Supabase se combina historial local y nube por ID y fecha de actualización. No se migra ni sobrescribe el historial de la aplicación avanzada.
Se aplicó la migración cuenta_clara_simple_calculations_20261018 al proyecto cuenta-clara-db (evmwuvjgokkxxnckhiyc), sin tocar Party Challenge. Comprobado: RLS activado; rol anon sin SELECT; rol authenticated con SELECT; cuatro políticas por usuario.

## Pruebas y limitaciones
- Node: tests/simple-core.test.cjs verifica repartos, redondeos en CLP, propina, pagos y conciliación.
- Chromium: tests/simple-browser.test.cjs prueba flujo sin registro en móvil y escritorio, historial local, resultados y capturas.
- Falta QA con usuarios reales de Supabase en dos dispositivos para declarar sincronización E2E validada.
- La conciliación con boleta es manual; OCR y cuentas compartidas avanzadas quedan accesibles en la versión anterior, no en el flujo simple.
- No fusionar ni publicar producción antes de revisión de vista previa y pruebas de integración.

## Publicación / reversión
Rama: feature/cuenta-clara-2-calculadora-simple. Se mantiene PR borrador hasta QA. Para revertir la interfaz, no fusionar o revertir los cambios frontend. La tabla nueva no se debe eliminar mientras conserve datos.
