# Divisor de Cuentas

Aplicacion web estatica para dividir cuentas entre varias personas, con productos compartidos, reparto proporcional por partes, historial de cuentas y exportaciones.

## Estructura valida del proyecto

```text
Cuentas/
  index.html
  styles.css
  script.js
  README.md
  vercel.json
  netlify.toml
```

La version valida es la raiz del proyecto. Las copias anidadas deben ignorarse o eliminarse.

## Funcionalidades principales

- Agregar, editar y eliminar personas.
- Agregar, editar y eliminar productos.
- Division igual o division proporcional por partes.
- Propina editable.
- Historial de cuentas guardadas en `localStorage`.
- Exportar resumen como SVG, PNG o PDF.
- Exportar e importar todos los datos como JSON.

## Moneda

La aplicacion usa pesos chilenos:

- Locale: `es-CL`
- Currency: `CLP`

Los montos se muestran sin decimales.

## Probar localmente

Abre `index.html` directamente en el navegador.

## Publicar en Vercel

1. Sube esta carpeta a GitHub.
2. En Vercel, importa el repositorio.
3. Usa estas opciones:
   - Framework Preset: `Other`
   - Build command: vacio
   - Output directory: vacio
   - Root directory: `./`

## Publicar en Netlify

1. Sube esta carpeta a GitHub.
2. Importa el repositorio en Netlify.
3. Usa estas opciones:
   - Build command: vacio
   - Publish directory: `.`

## Importante

Los datos siguen guardandose en `localStorage`, por lo que cada dispositivo mantiene sus propios datos locales si no usas la exportacion e importacion JSON.
