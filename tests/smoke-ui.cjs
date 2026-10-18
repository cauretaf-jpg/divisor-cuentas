// Smoke test real en Chromium para la interfaz de Cuenta Clara.
// No crea usuarios, cuentas remotas ni altera Supabase. Requiere Playwright.
// Ejecutar en GitHub Actions con npm install --no-save playwright.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const screenshots = path.join(process.cwd(), 'artifacts', 'ui');
fs.mkdirSync(screenshots, { recursive: true });

const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], {
  cwd: process.cwd(),
  stdio: 'ignore',
});
const base = 'http://127.0.0.1:8765/app.html';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(base);
      if (r.status === 200) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('Servidor HTTP local no responde');
}
(async () => {
  let browser;
  const pageErrors = [];
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('dialog', (dialog) => dialog.dismiss());
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('#ccHomeStoredCount').waitFor({ state: 'visible', timeout: 30000 });
    console.log('Diagnóstico de la cabecera:', JSON.stringify(await page.locator('#ccCreateHeroTitle').evaluate((el) => {
      const parents = [];
      let node = el;
      for (let i = 0; node && i < 7; i++, node = node.parentElement) {
        const style = getComputedStyle(node);
        parents.push({ tag: node.tagName, className: String(node.className).slice(0,110),
          display: style.display, visibility: style.visibility, opacity: style.opacity,
          width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height });
      }
      return parents;
    })));
    await page.screenshot({ path: path.join(screenshots, 'diagnostico-inicio.png'), fullPage: true });
    await page.locator('#ccCreateHeroTitle').waitFor({ state: 'visible', timeout: 4000 });
    assert.match(await page.locator('#ccCreateHeroTitle').innerText(), /Qué quieres dividir/i);
    await page.screenshot({ path: path.join(screenshots, 'inicio-movil.png'), fullPage: true });

    await page.locator('[data-cc-home-template="bar"]').click({ timeout: 20000 });
    await page.locator('#accountWizard:not(.hidden)').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('#accountWizardBackButton').click({ timeout: 15000 });
    await page.locator('[data-wizard-template="bar"].is-selected').waitFor({ state: 'visible', timeout: 15000 });
    await page.screenshot({ path: path.join(screenshots, 'asistente-bar.png'), fullPage: true });

    // El historial abre con todas las cuentas y cambia con filtros rápidos.
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('#ccHomeStoredCount').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#appSection-home .cc-text-link').click({ timeout: 15000 });
    await page.locator('#appSection-history.is-active').waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(await page.locator('#historyFilterSelect').inputValue(), 'everything');
    await page.locator('[data-cc-history-filter="pending"]').click();
    assert.equal(await page.locator('#historyFilterSelect').inputValue(), 'pending');
    assert.equal(await page.locator('[data-cc-history-filter="pending"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-cc-history-filter="everything"]').click();
    assert.equal(await page.locator('#historyFilterSelect').inputValue(), 'everything');
    await page.screenshot({ path: path.join(screenshots, 'historial-movil.png'), fullPage: true });

    // Comprobar versión de escritorio con el mismo flujo y sin desbordes.
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('#ccCreateHeroTitle').waitFor({ state: 'visible', timeout: 30000 });
    const noHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth <= document.documentElement.clientWidth + 4);
    assert.ok(noHorizontalOverflow, 'La página de escritorio desborda horizontalmente');
    await page.screenshot({ path: path.join(screenshots, 'inicio-escritorio.png'), fullPage: true });
    console.log('Chromium: Inicio, asistente Bar e Historial móvil y escritorio aprobados.');
    if (pageErrors.length) console.warn('Errores detectados en consola (revisar):', pageErrors.slice(0, 8));
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.kill('SIGTERM'); });
