# Documentación de Cuenta Clara

## Documento principal

El estado funcional, arquitectura, publicación, Supabase, validaciones y pendientes del proyecto están en el archivo raíz:

- [`../README.md`](../README.md)

## Última versión registrada

**v13.20.4 — Acceso de sesión visible**

- Se corrige la invisibilidad del botón de inicio de sesión en móviles de hasta 480px.
- La landing pública muestra accesos explícitos para iniciar sesión o usar la app como invitado.
- `app.html?auth=login` abre directamente el modal de acceso; `?auth=register` abre el registro.
- No requiere SQL ni dependencias nuevas.

## Estructura de esta carpeta

- `revisiones/`: bitácoras técnicas por versión.
- `validaciones/`: resultados de revisiones estructurales por versión.
- `LEEME_PRIMERO.txt`: referencia histórica; el README raíz prevalece como fuente de estado actual.
