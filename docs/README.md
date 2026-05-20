# Cuenta Clara V13.19

Versión enfocada en limpieza visual, sitio informativo público y separación entre landing y app.

## Nuevo en V13.19

- `index.html` ahora es una landing pública.
- `app.html` contiene la aplicación principal.
- Nuevas páginas públicas: Cómo funciona, Funciones, Preguntas frecuentes, Privacidad, Términos y Contacto.
- Footer legal visible.
- Aviso de Modo simple / Vista avanzada movido al final del menú lateral.

## Publicación

Subir todos los archivos a GitHub/Vercel. La app se abre desde `app.html`; la página pública principal queda en `index.html`.


## Ajuste V13.19

- Se elimino informacion visible innecesaria sobre anuncios.
- ads.txt se conserva en raiz, pero deja de aparecer como enlace publico.
- No cambia la logica de la app.

## Ajuste V13.19 - limpieza técnica visible

- Se reemplazaron textos visibles sobre configuración técnica de notificaciones por mensajes simples para usuarios.
- `Estado de conexión` pasa a mostrarse como `Estado de la app`.
- `Respaldo y diagnóstico` pasa a mostrarse como `Respaldo y estado`.
- Se agregó `.vercelignore` para evitar publicar carpetas internas como `docs/`, `sql/`, `supabase/` y `tools/`.


AJUSTE V13.19 - CONTACTO FUNCIONAL
- Página Contacto con formulario validado.
- Botón Enviar por correo mediante mailto.
- Botón Copiar mensaje como respaldo.
- Mejoras visuales móviles en contacto.
- No requiere SQL nuevo.


AJUSTE V13.19 - ASISTENTE GUIADO
- Nueva cuenta abre un flujo enfocado con pasos y navegación mínima.
- Funciona en celular y escritorio.
- No requiere SQL nuevo.
