# Cuenta Clara V11.4

Versión enfocada en mejorar la experiencia desde celular con navegación tipo app.

## Nuevo en V11.4

- Barra inferior fija en celular con accesos principales:
  - Personas
  - Gastos
  - Resumen
  - Pagos
- Pantallas móviles más independientes.
- Encabezado móvil por sección con botón Atrás.
- Menú de secciones oculto en celular para reducir ruido visual.
- Se mantiene la navegación de escritorio.
- Cache/service worker actualizado a `v11.4`.

## Flujo recomendado en celular

1. Crear o elegir una cuenta.
2. Entrar a Personas para agregar participantes y pagador.
3. Entrar a Gastos para registrar productos, boleta o monto rápido.
4. Entrar a Resumen para revisar cálculos.
5. Entrar a Pagos para compartir y marcar transferencias.

## Archivos principales modificados

- `index.html`
- `styles.css`
- `script.js`
- `service-worker.js`
- `perfil.html`
- `profile.js`

## Validación

Se validó sintaxis JavaScript con:

```bash
node --check script.js
node --check profile.js
```
