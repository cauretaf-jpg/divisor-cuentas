CUENTA CLARA V13.18.4 - PUBLICACION EN VERCEL

Este ZIP está preparado para publicarse con los archivos directamente en la raíz del proyecto.

IMPORTANTE:
- index.html debe quedar directamente en la raíz del repositorio/proyecto.
- app.html debe quedar directamente en la raíz del repositorio/proyecto.
- NO dejes los archivos dentro de una subcarpeta como Cuenta-Clara-v13.18.4/ dentro del repositorio, porque Vercel puede responder 404 en https://divisor-cuentas.vercel.app/.

Estructura esperada en la carpeta del proyecto:
index.html
app.html
styles.css
script.js
shared-utils.js
profile.js
service-worker.js
manifest.json
vercel.json
ads.txt
assets/

Después de subir:
1. Verifica que GitHub muestre index.html en la primera pantalla del repositorio, no dentro de una carpeta.
2. Espera que Vercel termine el deployment.
3. Abre https://divisor-cuentas.vercel.app/
4. Haz Ctrl + Shift + R en Chrome para limpiar caché.

Si sigue apareciendo 404, revisa en Vercel:
- Project Settings > Build & Development Settings.
- Framework Preset: Other.
- Build Command: vacío.
- Output Directory: vacío.
