# Revisión v13.22.0 — Asistente contextual y propina (2026-10-17)

## Alcance
Rama de desarrollo separada de producción. Implementación incremental en la aplicación estática existente sin reescribir historial, autenticación ni colaboración.

- Pantalla inicial contextual: Bar, Restaurante, Supermercado, Cafetería, Juntada/Evento, Hogar, Viaje, Streaming, Cuenta rápida, Otra.
- Sugerencias de productos contextuales. Sin precio automático; requiere confirmar precio, consumidores y agregar.
- Propina de 0 %, 10 % o personalizada para bar, restaurante y cafetería.
- Distribución de propina: proporcional (sobre consumo actual), igual, montos personalizados y exenciones.
- Validación de suma para distribución personalizada y de persona elegible.
- Conservación de la selección de modo de gasto y propina entre pasos.
- Exclusión de deudas anteriores de la base sobre la que se calcula propina.
- Mejora de tarjetas y sugerencias responsive.
- Actualización de recursos con versión 13.22.0 y caché de service worker.

## Arquitectura
Archivos modificados principales: script.js, styles.css, app.html, index.html, perfil.html, service-worker.js, README.md y recursos estáticos con versiones en query. Sin cambios de tablas ni de RLS. Campos nuevos en estado local/nube normalizados: tipSplitMode, tipExemptIds, tipCustomAmounts. Compatibles con cuentas antiguas (modo proporcional si no están presentes). La exportación/importación completa del estado usa normalización de cuentas.

## Cálculo
La propina se calcula sobre consumo del mes sin deuda anterior; el total se redondea a pesos enteros (CLP). Proporcional e igual reparte los pesos enteros entre elegibles mediante restos mayores, evitando diferencias de redondeo en la suma. Personalizado exige que la suma de asignaciones sea exactamente la propina. Participantes marcados como exentos tienen 0 pesos de propina. En modo Hogar se deshabilita propina.

## Riesgos identificados y cautelas
- Cuenta Clara usa Supabase configurado en supabase-config.js, pero ese proyecto no se encuentra dentro de los proyectos accesibles de Supabase del conector. Sin acceso no se puede verificar autenticación/sincronización/invitaciones ni ejecutar migraciones con confianza.
- Vercel confirma compilación/publicación de vista previa READY, pero no verifica interacción completa ni persistencia de datos.
- Evitar fusionar esta rama hasta ejecutar pruebas manuales de usuario y revisar cada flujo.
- No se hizo limpieza destructiva del directorio duplicado assets/ ni se modificó Party Challenge.
- La función de múltiples pagadores y la conciliación de boleta dentro del asistente requieren rediseño adicional.

## Pruebas
Pruebas de funciones aisladas: sintaxis JavaScript; proporción con restos; división igual de propina; exención de personas; reparto personalizado; total rápido con 10 %; deuda arrastrada no lleva propina. Todas pasaron. Ver reporte JSON adjunto.

## Criterios pendientes para aceptar
1. Crear cuenta de bar y restauración en móvil, agregar sugerencias, consumidores y propina.
2. Ir adelante/atrás sin perder la selección de modo o propina.
3. Probar reparto igual/personalizado y exenciones con total conciliado.
4. Editar, volver al resumen, historial, pagos, exportación, WhatsApp y borradores.
5. Iniciar sesión con dos usuarios reales; probar cuenta compartida, invitación, aceptación, RLS y sincronización.
6. Verificar PWA y caché en Android e iOS, navegación de escritorio, accesibilidad y cierre de sesión.
7. Revisar que el diseño coincida con la propuesta visual y que ninguna vista existente haya quedado inaccesible.
