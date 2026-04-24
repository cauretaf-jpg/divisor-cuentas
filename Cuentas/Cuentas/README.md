# Divisor de Cuentas

App web estatica para dividir cuentas entre varias personas.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`

## Publicar en Netlify

1. Crea una cuenta en Netlify.
2. Sube esta carpeta a un repositorio de GitHub.
3. En Netlify, elige `Add new site` -> `Import an existing project`.
4. Conecta tu repositorio.
5. Usa esta configuracion:
   - Build command: dejar vacio
   - Publish directory: `.`
6. Publica el sitio.

## Publicar en Vercel

1. Crea una cuenta en Vercel.
2. Sube esta carpeta a un repositorio de GitHub.
3. En Vercel, elige `Add New...` -> `Project`.
4. Importa el repositorio.
5. Usa esta configuracion:
   - Framework Preset: `Other`
   - Build command: dejar vacio
   - Output directory: dejar vacio
6. Publica el proyecto.

## Importante

Actualmente los datos se guardan en `localStorage`.
Eso significa que:

- Cada computador o celular tendra sus propios datos.
- La pagina funcionara en todos los dispositivos.
- Las cuentas no se sincronizan entre dispositivos todavia.

## Probar localmente

Solo abre `index.html` en el navegador.
