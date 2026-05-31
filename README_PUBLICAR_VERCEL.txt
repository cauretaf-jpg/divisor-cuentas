CUENTA CLARA V13.21 - ADSENSE READY

Este ZIP está preparado para publicarse con los archivos directamente en la raíz del proyecto.

IMPORTANTE:
- index.html debe quedar directamente en la raíz del repositorio/proyecto.
- app.html debe quedar directamente en la raíz del repositorio/proyecto.
- NO dejes los archivos dentro de una subcarpeta como Cuenta-Clara-v13.21/ dentro del repositorio.
- El archivo ads.txt debe quedar en https://divisor-cuentas.vercel.app/ads.txt.

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
robots.txt
sitemap.xml
assets/

CAMBIOS V13.21 - ADSENSE READY:
- Se refuerza el contenido público del sitio para que Google no vea la web solo como una herramienta sin contexto.
- Se agrega página Acerca de.
- Se amplían Inicio, Cómo funciona, Funciones y Preguntas frecuentes.
- Se actualiza Privacidad con cookies, almacenamiento local, Google AdSense, publicidad, servicios externos y respaldos.
- Se actualiza Términos con límites claros: Cuenta Clara no es servicio financiero, no procesa pagos y no verifica transferencias.
- Se mantiene ads.txt correcto en la raíz y se agrega copia en public/ads.txt para despliegues tipo Vite.
- Se agregan robots.txt y sitemap.xml.
- Se agrega ruta /acerca-de en vercel.json.
- Se mantiene el script de AdSense en páginas públicas. No se fuerza publicidad dentro del flujo principal de la app para evitar anuncios cerca de botones de acción.

DESPUÉS DE SUBIR:
1. Verifica https://divisor-cuentas.vercel.app/ads.txt
2. Debe mostrar: google.com, pub-4358472434423818, DIRECT, f08c47fec0942fa0
3. Verifica que el código fuente de https://divisor-cuentas.vercel.app/ contenga ca-pub-4358472434423818
4. Abre https://divisor-cuentas.vercel.app/privacidad y revisa que mencione Google AdSense.
5. En AdSense, corrige los datos de cuenta/pagos si sigue apareciendo "información imprecisa o incompleta".
6. Recién después vuelve a enviar la solicitud.

NOTA SOBRE CONTACTO:
- La página contacto usa CONTACT_EMAIL = cuenta.clara.divisor@gmail.com.
- Antes de publicar de forma definitiva, confirma que ese correo exista y reciba mensajes. Si no existe, reemplázalo por un correo real de soporte.
