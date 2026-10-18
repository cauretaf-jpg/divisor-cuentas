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
    const design = await page.evaluate(() => {
      const hero = document.querySelector('.cc-create-hero');
      const tile = document.querySelector('[data-cc-home-template="bar"]');
      const panel = document.querySelector('#homeDashboardPanel');
      const heroStyle = getComputedStyle(hero);
      const tileStyle = getComputedStyle(tile);
      return {
        theme: document.body.classList.contains('cc-pdf-redesign'),
        heroBg: heroStyle.backgroundImage,
        heroColor: heroStyle.color,
        tileBg: tileStyle.backgroundColor,
        tileRadius: tileStyle.borderRadius,
        cardBg: getComputedStyle(panel).backgroundColor,
        designLoaded: [...document.styleSheets].some((sheet) => String(sheet.href || '').includes('design-pdf.css')),
      };
    });
    assert.ok(design.theme && design.designLoaded, 'El tema del PDF debe estar cargado');
    assert.equal(design.heroBg, 'none', 'El encabezado del PDF no tiene degradado');
    assert.match(design.tileBg, /rgb\(/, 'Las tarjetas deben tener fondo sólido');
    assert.match(design.cardBg, /rgb\(/, 'La superficie de Inicio debe tener fondo sólido');
    console.log('Diseño PDF: estilos aplicados', JSON.stringify(design));
    await page.screenshot({ path: path.join(screenshots, 'inicio-movil.png'), fullPage: true });

    await page.locator('[data-cc-home-template="bar"]').click({ timeout: 20000 });
    await page.locator('#accountWizard:not(.hidden)').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('#accountWizardTopBackButton').click({ timeout: 15000 });
    await page.locator('[data-wizard-template="bar"].is-selected').waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(await page.locator('.cc-wizard-progress-segment').count(), 5);
    await page.locator('.cc-wizard-brand').waitFor({ state: 'visible', timeout: 8000 });
    assert.match(await page.locator('#accountWizardTitle').innerText(), /Qué quieres dividir/);
    const wizardDesign = await page.locator('.account-wizard-panel').evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      titleColor: getComputedStyle(el.querySelector('h1')).color,
      footerPrimary: getComputedStyle(el.querySelector('#accountWizardNextButton')).backgroundColor,
    }));
    console.log('Diseño PDF asistente:', JSON.stringify(wizardDesign));
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

    // Revisión con datos exclusivamente locales de ejemplo: sin usuarios reales.
    const peoplePending = [
      { id: 'p1', name: 'Ana', previousDebt: 0, paid: true },
      { id: 'p2', name: 'Beto', previousDebt: 0, paid: false },
    ];
    const peoplePaid = peoplePending.map((person) => ({ ...person, paid: true }));
    const exampleBills = {
      bills: [
        { id: 'bill_smoke_bar', name: 'Salida de bar', mode: 'quick', quickTotal: 20000,
          payerId: 'p1', tipPercent: 10, people: peoplePending, products: [],
          archived: false, closed: false, createdAt: '2026-10-18T12:00:00.000Z', updatedAt: '2026-10-18T12:00:00.000Z' },
        { id: 'bill_smoke_cafe', name: 'Cafetería pagada', mode: 'quick', quickTotal: 15000,
          payerId: 'p1', tipPercent: 0, people: peoplePaid, products: [],
          archived: false, closed: false, createdAt: '2026-10-17T12:00:00.000Z', updatedAt: '2026-10-17T12:00:00.000Z' },
      ],
      activeBillId: 'bill_smoke_bar',
    };
    await page.evaluate((seed) => {
      localStorage.setItem('cuenta-clara-v1-state', JSON.stringify(seed));
      localStorage.setItem('cuenta-clara-active-section', 'home');
    }, exampleBills);
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('#ccHomeStoredCount').waitFor({ state: 'visible', timeout: 20000 });
    assert.equal((await page.locator('#ccHomeStoredCount').innerText()).trim(), '2',
      'Inicio debe mostrar dos cuentas de ejemplo');
    await page.locator('#appSection-home .cc-text-link').click();
    await page.locator('#appSection-history.is-active').waitFor({ state: 'visible' });
    assert.match(await page.locator('#ccHistoryResultsCount').innerText(), /2 de 2 cuentas/);
    await page.locator('[data-cc-history-filter="pending"]').click();
    assert.equal(await page.locator('#appSection-history .history-bill-card').count(), 1);
    assert.match(await page.locator('#appSection-history .history-bill-main').innerText(), /Salida de bar/);
    await page.locator('[data-cc-history-filter="paid"]').click();
    assert.equal(await page.locator('#appSection-history .history-bill-card').count(), 1);
    assert.match(await page.locator('#appSection-history .history-bill-main').innerText(), /Cafetería pagada/);
    await page.locator('[data-cc-history-filter="everything"]').click();
    await page.screenshot({ path: path.join(screenshots, 'historial-ejemplo-movil.png'), fullPage: true });
    await page.locator('#appSection-history .history-bill-open').first().click();
    await page.locator('#appSection-summary.is-active').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#billNameInput').inputValue(), 'Salida de bar');

    // Comprobar versión de escritorio con el mismo flujo y sin desbordes.
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // La app restaura la última sección visitada (en esta prueba, Resumen).
    await page.locator('#appSection-summary.is-active').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('.section-nav-button[data-app-section="home"]').click({ timeout: 15000 });
    await page.locator('#ccCreateHeroTitle').waitFor({ state: 'visible', timeout: 15000 });
    const noHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth <= document.documentElement.clientWidth + 4);
    assert.ok(noHorizontalOverflow, 'La página de escritorio desborda horizontalmente');
    await page.screenshot({ path: path.join(screenshots, 'inicio-escritorio.png'), fullPage: true });
    await page.locator('#homeAllTypesButton').click();
    await page.locator('#accountWizard:not(.hidden)').waitFor({ state: 'visible', timeout: 8000 });
    await page.locator('.cc-wizard-aside').waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(screenshots, 'asistente-escritorio.png'), fullPage: true });
    console.log('Chromium: rediseño PDF, asistente, cuentas ficticias e Historial móvil/escritorio aprobados.');
    if (pageErrors.length) console.warn('Errores detectados en consola (revisar):', pageErrors.slice(0, 8));
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.kill('SIGTERM'); });
