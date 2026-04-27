// Estado inicial
const STORAGE_KEY = 'divisor-cuentas-app';
const LEGACY_STORAGE_KEY = 'divisor-cuentas-state';

const state = {
  theme: 'light',
  activeBillId: '',
  bills: [],
};

let editingPersonId = null;
let editingProductId = null;

const UNDO_LIMIT = 10;
const undoStack = [];
let undoTimer = null;
const undoToast = document.querySelector('#undoToast');
const undoMessage = document.querySelector('#undoMessage');
const undoActionButton = document.querySelector('#undoActionButton');

const themeToggleButton = document.querySelector('#themeToggleButton');
const billSelector = document.querySelector('#billSelector');
const newBillButton = document.querySelector('#newBillButton');
const duplicateBillButton = document.querySelector('#duplicateBillButton');
const deleteBillButton = document.querySelector('#deleteBillButton');
const billHistory = document.querySelector('#billHistory');

const accountNameInput = document.querySelector('#accountName');
const tipPercentageInput = document.querySelector('#tipPercentage');
const shareButton = document.querySelector('#shareButton');
const shareLinkButton = document.querySelector('#shareLinkButton');
const whatsAppButton = document.querySelector('#whatsAppButton');
const installButton = document.querySelector('#installButton');
const svgButton = document.querySelector('#svgButton');
const pngButton = document.querySelector('#pngButton');
const pdfButton = document.querySelector('#pdfButton');
const exportDataButton = document.querySelector('#exportDataButton');
const importDataButton = document.querySelector('#importDataButton');
const importFileInput = document.querySelector('#importFileInput');
const resetButton = document.querySelector('#resetButton');
const generalMessage = document.querySelector('#generalMessage');
const accountHeading = document.querySelector('#accountHeading');

const personForm = document.querySelector('#personForm');
const personNameInput = document.querySelector('#personName');
const personSubmitButton = document.querySelector('#personSubmitButton');
const personCancelButton = document.querySelector('#personCancelButton');
const personError = document.querySelector('#personError');
const peopleList = document.querySelector('#peopleList');
const peopleCount = document.querySelector('#peopleCount');

const productForm = document.querySelector('#productForm');
const productNameInput = document.querySelector('#productName');
const productPriceInput = document.querySelector('#productPrice');
const productQuantityInput = document.querySelector('#productQuantity');
const selectAllConsumersButton = document.querySelector('#selectAllConsumersButton');
const productSubmitButton = document.querySelector('#productSubmitButton');
const productCancelButton = document.querySelector('#productCancelButton');
const productConsumers = document.querySelector('#productConsumers');
const productError = document.querySelector('#productError');
const productsList = document.querySelector('#productsList');
const productCount = document.querySelector('#productCount');

const subtotalValue = document.querySelector('#subtotalValue');
const tipValue = document.querySelector('#tipValue');
const grandTotalValue = document.querySelector('#grandTotalValue');
const results = document.querySelector('#results');
const clearPaymentsButton = document.querySelector('#clearPaymentsButton');

function createEmptyBill(name = 'Nueva cuenta') {
  return {
    id: crypto.randomUUID(),
    accountName: name,
    tipPercentage: 10,
    people: [],
    products: [],
    paidPeople: [],
  };
}

function duplicateBill(sourceBill) {
  return {
    id: crypto.randomUUID(),
    accountName: `${sourceBill.accountName.trim() || 'Cuenta'} copia`,
    tipPercentage: sourceBill.tipPercentage,
    people: sourceBill.people.map((person) => ({ ...person })),
    products: sourceBill.products.map((product) => ({
      ...product,
      consumerSplits: product.consumerSplits.map((split) => ({ ...split })),
    })),
  };
}

function getActiveBill() {
  let bill = state.bills.find((item) => item.id === state.activeBillId);

  if (!bill) {
    bill = state.bills[0];
    if (bill) {
      state.activeBillId = bill.id;
    }
  }

  if (!bill) {
    bill = createEmptyBill();
    state.bills.push(bill);
    state.activeBillId = bill.id;
  }

  return bill;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeName(value) {
  return value.trim().toLocaleLowerCase('es-CL');
}

function setMessage(element, message, type = '') {
  element.textContent = message;
  element.className = 'form-message';
  if (type) {
    element.classList.add(type);
  }
}

function clearMessages() {
  setMessage(personError, '');
  setMessage(productError, '');
  setMessage(generalMessage, '');
}

function applyTheme() {
  let actualTheme = state.theme;
  if (state.theme === 'system') {
    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = actualTheme;
  const labels = { light: 'Modo oscuro', dark: 'Modo claro', system: 'Auto' };
  const fullLabel = labels[state.theme] || 'Modo oscuro';
  themeToggleButton.innerHTML = fullLabel.replace(' ', '<br>');
}

// Undo
const paidPeople = [];
let paidCount = 0;

function captureActiveBill() {
  const bill = getActiveBill();
  return JSON.parse(JSON.stringify(bill));
}

function pushUndo(message) {
  const snapshot = captureActiveBill();
  undoStack.unshift({ message, snapshot });
  if (undoStack.length > UNDO_LIMIT) {
    undoStack.pop();
  }
  renderUndoToast(message);
}

function performUndo() {
  if (undoStack.length === 0) return;
  const entry = undoStack.shift();
  const existingIndex = state.bills.findIndex((b) => b.id === entry.snapshot.id);
  if (existingIndex !== -1) {
    state.bills[existingIndex] = entry.snapshot;
  } else {
    state.bills.push(entry.snapshot);
  }
  state.activeBillId = entry.snapshot.id;
  editingPersonId = null;
  editingProductId = null;
  hideUndoToast();
  persistAndRender('Cambio deshecho.', 'success');
}

function renderUndoToast(message) {
  undoMessage.textContent = message;
  undoToast.classList.remove('hidden');
  if (undoTimer) clearTimeout(undoTimer);
  undoTimer = setTimeout(() => hideUndoToast(), 8000);
}

function hideUndoToast() {
  undoToast.classList.add('hidden');
  if (undoTimer) {
    clearTimeout(undoTimer);
    undoTimer = null;
  }
}

// LocalStorage
function normalizeBill(rawBill) {
  return {
    id: rawBill.id || crypto.randomUUID(),
    accountName: typeof rawBill.accountName === 'string' ? rawBill.accountName : '',
    tipPercentage: Number.isFinite(Number(rawBill.tipPercentage)) ? Math.max(0, Number(rawBill.tipPercentage)) : 10,
    people: Array.isArray(rawBill.people)
      ? rawBill.people
          .filter((person) => person && typeof person.name === 'string' && person.name.trim())
          .map((person) => ({ id: person.id || crypto.randomUUID(), name: person.name.trim() }))
      : [],
    products: Array.isArray(rawBill.products)
      ? rawBill.products
          .filter((product) => product && typeof product.name === 'string' && product.name.trim())
          .map((product) => {
            const unitPrice = Math.max(0, Number(product.unitPrice ?? product.price) || 0);
            const quantity = Math.max(1, Number(product.quantity) || 1);
            const rawSplits = Array.isArray(product.consumerSplits)
              ? product.consumerSplits
              : Array.isArray(product.consumerIds)
                ? product.consumerIds.map((personId) => ({ personId, share: 1 }))
                : [];

            return {
              id: product.id || crypto.randomUUID(),
              name: product.name.trim(),
              unitPrice,
              quantity,
              price: unitPrice * quantity,
              splitMode: product.splitMode === 'weighted' ? 'weighted' : 'equal',
              consumerSplits: rawSplits
                .filter((split) => split && split.personId)
                .map((split) => ({
                  personId: split.personId,
                  share: Math.max(1, Number(split.share) || 1),
                })),
            };
          })
      : [],
    paidPeople: Array.isArray(rawBill.paidPeople) ? rawBill.paidPeople : [],
  };
}

function normalizeAppState(rawState) {
  const bills = Array.isArray(rawState.bills) ? rawState.bills.map(normalizeBill) : [];

  return {
    theme: ['light', 'dark', 'system'].includes(rawState.theme) ? rawState.theme : 'light',
    activeBillId: typeof rawState.activeBillId === 'string' ? rawState.activeBillId : '',
    bills: bills.length > 0 ? bills : [createEmptyBill()],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadLegacyState() {
  const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);
    return normalizeAppState({
      theme: 'light',
      activeBillId: '',
      bills: [parsed],
    });
  } catch (error) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      Object.assign(state, normalizeAppState(JSON.parse(saved)));
      return;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const legacyState = loadLegacyState();
  if (legacyState) {
    Object.assign(state, legacyState);
    state.activeBillId = state.bills[0]?.id || '';
    saveState();
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return;
  }

  state.bills = [createEmptyBill()];
  state.activeBillId = state.bills[0].id;
}

// Validaciones
function validatePersonName(name, bill, ignorePersonId = null) {
  if (!name.trim()) {
    return 'No puedes agregar una persona con nombre vacio.';
  }

  const normalized = normalizeName(name);
  const exists = bill.people.some((person) => person.id !== ignorePersonId && normalizeName(person.name) === normalized);
  if (exists) {
    return 'Ya existe una persona con ese nombre.';
  }

  return '';
}

function validateProductData(name, unitPrice, quantity, consumerSplits) {
  if (!name.trim()) {
    return 'No puedes agregar un producto con nombre vacio.';
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return 'Debes ingresar un valor valido para el producto.';
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 'Debes ingresar una cantidad valida.';
  }

  if (consumerSplits.length === 0) {
    return 'No puedes agregar un producto sin seleccionar personas.';
  }

  return '';
}

function getProductsLinkedToPerson(bill, personId) {
  return bill.products.filter((product) => product.consumerSplits.some((split) => split.personId === personId));
}

// Cálculos
function calculateSummary() {
  const activeBill = getActiveBill();
  const subtotal = activeBill.products.reduce((sum, product) => sum + product.price, 0);
  const tipAmount = subtotal * (activeBill.tipPercentage / 100);
  const totalsByPerson = activeBill.people.map((person) => ({
    ...person,
    subtotal: 0,
    tip: 0,
    total: 0,
    items: [],
  }));

  activeBill.products.forEach((product) => {
    const participants = product.consumerSplits
      .map((split) => ({
        share: product.splitMode === 'weighted' ? split.share : 1,
        person: totalsByPerson.find((item) => item.id === split.personId),
      }))
      .filter((item) => item.person);

    const totalShares = participants.reduce((sum, participant) => sum + participant.share, 0);
    if (totalShares <= 0) {
      return;
    }

    participants.forEach((participant) => {
      const amount = product.price * (participant.share / totalShares);
      participant.person.subtotal += amount;
      participant.person.items.push({
        label: `${product.name} (${product.quantity} x ${formatCurrency(product.unitPrice)})`,
        value: amount,
        share: participant.share,
        splitMode: product.splitMode,
      });
    });
  });

  totalsByPerson.forEach((person) => {
    person.tip = person.subtotal * (activeBill.tipPercentage / 100);
    person.total = person.subtotal + person.tip;
  });

  return {
    subtotal,
    tipAmount,
    grandTotal: subtotal + tipAmount,
    totalsByPerson,
  };
}

function getAccountTitle() {
  return getActiveBill().accountName.trim() || 'Cuenta sin nombre';
}

function formatConsumerBreakdown(product, people) {
  return product.consumerSplits.map((split) => {
    const name = people.find((person) => person.id === split.personId)?.name || 'Sin nombre';
    return product.splitMode === 'weighted' ? `${name} x${split.share}` : name;
  }).join(', ');
}

function buildShareText(summary = calculateSummary()) {
  const activeBill = getActiveBill();
  const lines = [getAccountTitle(), `Propina: ${activeBill.tipPercentage}%`, ''];

  summary.totalsByPerson.forEach((person) => {
    lines.push(`${person.name}: ${formatCurrency(person.total)}`);
    person.items.forEach((item) => {
      const partDetail = item.splitMode === 'weighted' ? `, parte ${item.share}` : '';
      lines.push(`- ${item.label}${partDetail}: ${formatCurrency(item.value)}`);
    });
    lines.push(`  Subtotal: ${formatCurrency(person.subtotal)}`);
    lines.push(`  Propina: ${formatCurrency(person.tip)}`);
    lines.push('');
  });

  lines.push(`Subtotal general: ${formatCurrency(summary.subtotal)}`);
  lines.push(`Propina general: ${formatCurrency(summary.tipAmount)}`);
  lines.push(`Total general: ${formatCurrency(summary.grandTotal)}`);
  return lines.join('\n').trim();
}

// Renderizado
function resetPersonForm() {
  editingPersonId = null;
  personForm.reset();
  personSubmitButton.textContent = 'Agregar persona';
  personCancelButton.classList.add('hidden');
}

function resetProductForm() {
  editingProductId = null;
  productForm.reset();
  productQuantityInput.value = '1';
  productSubmitButton.textContent = 'Agregar producto';
  productCancelButton.classList.add('hidden');
  const equalRadio = productForm.querySelector('input[name="splitMode"][value="equal"]');
  if (equalRadio) {
    equalRadio.checked = true;
  }
  renderPeopleOptions();
}

function getSplitMode() {
  return productForm.querySelector('input[name="splitMode"]:checked')?.value || 'equal';
}

function renderBillSelector() {
  const activeBill = getActiveBill();
  billSelector.innerHTML = state.bills.map((bill, index) => `
    <option value="${escapeHtml(bill.id)}" ${bill.id === activeBill.id ? 'selected' : ''}>
      ${escapeHtml(bill.accountName.trim() || `Cuenta ${index + 1}`)}
    </option>
  `).join('');
}

function renderBillHistory() {
  const activeBill = getActiveBill();
  billHistory.innerHTML = state.bills.map((bill, index) => `
    <button type="button" class="history-item ${bill.id === activeBill.id ? 'active' : ''}" data-history-bill="${escapeHtml(bill.id)}">
      <p class="history-title">${escapeHtml(bill.accountName.trim() || `Cuenta ${index + 1}`)}</p>
      <p class="history-meta">${bill.people.length} personas · ${bill.products.length} productos</p>
    </button>
  `).join('');
}

function renderPeopleOptions(selectedSplits = []) {
  const activeBill = getActiveBill();

  if (activeBill.people.length === 0) {
    productConsumers.className = 'consumer-grid empty-state-inline';
    productConsumers.textContent = 'Agrega personas primero';
    selectAllConsumersButton.disabled = true;
    return;
  }

  const splitLookup = new Map(selectedSplits.map((item) => [item.personId, item.share]));
  const splitMode = editingProductId
    ? activeBill.products.find((product) => product.id === editingProductId)?.splitMode || getSplitMode()
    : getSplitMode();

  productConsumers.className = 'consumer-grid';
  selectAllConsumersButton.disabled = false;
  productConsumers.innerHTML = activeBill.people.map((person) => {
    const selected = splitLookup.has(person.id);
    const share = splitLookup.get(person.id) || 1;

    return `
      <label class="consumer-card">
        <input type="checkbox" data-consumer-check value="${escapeHtml(person.id)}" ${selected ? 'checked' : ''}>
        <div>
          <strong class="consumer-name">${escapeHtml(person.name)}</strong>
          <div class="item-detail">${splitMode === 'equal' ? 'Se divide en partes iguales entre quienes esten marcados.' : 'Define cuantas partes le corresponden a cada persona.'}</div>
        </div>
        <div class="share-wrap">
          <span>Partes</span>
          <input class="share-input" type="number" min="1" step="1" value="${share}" data-consumer-share="${escapeHtml(person.id)}" ${selected && splitMode === 'weighted' ? '' : 'disabled'}>
        </div>
      </label>
    `;
  }).join('');
}

function renderPeopleList() {
  const activeBill = getActiveBill();
  peopleCount.textContent = String(activeBill.people.length);

  if (activeBill.people.length === 0) {
    peopleList.innerHTML = '<li class="empty-state">Aun no has agregado personas.</li>';
    return;
  }

  peopleList.innerHTML = activeBill.people.map((person) => `
    <li class="list-item">
      <div class="item-main">
        <p class="item-title">${escapeHtml(person.name)}</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost-button" data-edit-person="${escapeHtml(person.id)}">Editar</button>
        <button type="button" class="ghost-button" data-remove-person="${escapeHtml(person.id)}">Eliminar</button>
      </div>
    </li>
  `).join('');
}

function renderProductsList() {
  const activeBill = getActiveBill();
  productCount.textContent = String(activeBill.products.length);

  if (activeBill.products.length === 0) {
    productsList.innerHTML = '<li class="empty-state">Aun no has agregado productos.</li>';
    return;
  }

  productsList.innerHTML = activeBill.products.map((product) => `
    <li class="list-item">
      <div class="item-main">
        <p class="item-title">${escapeHtml(product.name)} · ${product.quantity} x ${formatCurrency(product.unitPrice)} = ${formatCurrency(product.price)}</p>
        <p class="item-detail">${product.splitMode === 'equal' ? 'Division igual' : 'Division proporcional por partes'}: ${escapeHtml(formatConsumerBreakdown(product, activeBill.people))}</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost-button" data-edit-product="${escapeHtml(product.id)}">Editar</button>
        <button type="button" class="ghost-button" data-remove-product="${escapeHtml(product.id)}">Eliminar</button>
      </div>
    </li>
  `).join('');
}

function renderSummary() {
  const activeBill = getActiveBill();
  const summary = calculateSummary();

  accountHeading.textContent = getAccountTitle();
  subtotalValue.textContent = formatCurrency(summary.subtotal);
  tipValue.textContent = `${formatCurrency(summary.tipAmount)} (${activeBill.tipPercentage}%)`;
  grandTotalValue.textContent = formatCurrency(summary.grandTotal);

  if (summary.totalsByPerson.length === 0 || activeBill.products.length === 0) {
    results.className = 'results empty-state';
  results.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;text-align:center;">
      <span style="font-size:1.6rem;">📝</span>
      <p style="margin:0;font-weight:700;">Aun no hay cálculos</p>
      <p style="margin:0;font-size:0.85rem;color:var(--muted);">Agrega personas y productos para ver el resumen aquí.</p>
    </div>
  `;
  return;
  }

  results.className = 'results';
  const paidCount = activeBill.paidPeople?.length || 0;
  const totalCount = summary.totalsByPerson.length;

  const unpaidAmount = summary.totalsByPerson
    .filter((p) => !activeBill.paidPeople?.includes(p.id))
    .reduce((sum, p) => sum + p.total, 0);

  const progressHtml = (paidCount > 0 || unpaidAmount > 0) ? `
    <div class="result-progress">
      <div>
        <span>${paidCount} de ${totalCount} personas han pagado</span>
        ${unpaidAmount > 0 ? `<span class="unpaid-amount">Faltan ${formatCurrency(unpaidAmount)} por cobrar</span>` : ''}
      </div>
      <strong>${Math.round((paidCount / totalCount) * 100)}%</strong>
    </div>
  ` : '';

  results.innerHTML = progressHtml + summary.totalsByPerson.map((person) => {
    const isPaid = activeBill.paidPeople?.includes(person.id);
    const itemsHtml = person.items.length > 0
      ? person.items.map((item) => `
          <div class="breakdown-item">
            <span>${escapeHtml(item.label)}${item.splitMode === 'weighted' ? ` · parte ${item.share}` : ''}</span>
            <strong>${formatCurrency(item.value)}</strong>
          </div>
        `).join('')
      : '<p class="item-detail">Sin productos asignados.</p>';

    return `
      <article class="result-card ${isPaid ? 'paid' : ''}">
        <label class="paid-checkbox">
          <input type="checkbox" data-paid-person="${escapeHtml(person.id)}" ${isPaid ? 'checked' : ''}>
          <h3 class="result-name">${escapeHtml(person.name)}</h3>
          ${isPaid ? '<span class="paid-badge">Pagado</span>' : ''}
        </label>
        <span class="result-detail">Subtotal: ${formatCurrency(person.subtotal)}</span>
        <span class="result-detail">Propina: ${formatCurrency(person.tip)}</span>
        <div class="result-breakdown">${itemsHtml}</div>
        <strong class="result-total">Total: ${formatCurrency(person.total)}</strong>
      </article>
    `;
  }).join('');
}

function render() {
  const activeBill = getActiveBill();
  applyTheme();
  renderBillSelector();
  renderBillHistory();
  accountNameInput.value = activeBill.accountName;
  tipPercentageInput.value = String(activeBill.tipPercentage);
  renderPeopleList();
  renderProductsList();
  renderPeopleOptions(editingProductId ? activeBill.products.find((product) => product.id === editingProductId)?.consumerSplits ?? [] : []);
  renderSummary();
}

function persistAndRender(message = '', type = '') {
  saveState();
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {});
}
  if (message) {
    setMessage(generalMessage, message, type);
  }
}

function collectConsumerSplits() {
  const splitMode = getSplitMode();
  const checks = Array.from(productConsumers.querySelectorAll('[data-consumer-check]:checked'));

  return checks.map((checkbox) => {
    const shareInput = productConsumers.querySelector(`[data-consumer-share="${checkbox.value}"]`);
    return {
      personId: checkbox.value,
      share: splitMode === 'weighted' ? Math.max(1, Number(shareInput?.value) || 1) : 1,
    };
  });
}

// Exportaciones
function copyTextFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch (error) {
    document.body.removeChild(textarea);
    return false;
  }
}

function createSummarySvg() {
  const summary = calculateSummary();
  const lines = buildShareText(summary).split('\n').slice(1);
  const width = 980;
  const lineHeight = 24;
  const height = 110 + (lines.length * lineHeight);
  const background = state.theme === 'dark' ? '#2a201c' : '#fffdfa';
  const titleColor = state.theme === 'dark' ? '#ffc49f' : '#8f4218';
  const textColor = state.theme === 'dark' ? '#f5ece5' : '#2a211c';
  const textNodes = lines.map((line, index) => `
    <text x="40" y="${66 + (index * lineHeight)}" font-size="18" font-family="Arial, Helvetica, sans-serif" fill="${textColor}">${escapeXml(line)}</text>
  `).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${background}" rx="26" ry="26" />
      <text x="40" y="38" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="${titleColor}">${escapeXml(getAccountTitle())}</text>
      ${textNodes}
    </svg>
  `.trim();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function getFileSafeName() {
  return (getAccountTitle().trim() || 'cuenta').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
}

function exportSvg() {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para exportar.');
    return;
  }

  const blob = new Blob([createSummarySvg()], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${getFileSafeName()}.svg`);
  setMessage(generalMessage, 'Resumen exportado como SVG.', 'success');
}

function exportPng() {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para exportar.');
    return;
  }

  const svgMarkup = createSummarySvg();
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        setMessage(generalMessage, 'No fue posible generar el PNG.');
        URL.revokeObjectURL(svgUrl);
        return;
      }

      downloadBlob(blob, `${getFileSafeName()}.png`);
      setMessage(generalMessage, 'Resumen exportado como PNG.', 'success');
      URL.revokeObjectURL(svgUrl);
    }, 'image/png');
  };

  image.onerror = () => {
    URL.revokeObjectURL(svgUrl);
    setMessage(generalMessage, 'No fue posible generar el PNG.');
  };

  image.src = svgUrl;
}

async function shareImage() {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para compartir.');
    return;
  }

  const svgMarkup = createSummarySvg();
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      canvas.toBlob(async (blob) => {
        URL.revokeObjectURL(svgUrl);
        if (!blob) {
          setMessage(generalMessage, 'No fue posible generar la imagen.');
          reject();
          return;
        }
        const fileName = `${getFileSafeName()}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: getAccountTitle(), text: 'Resumen de cuenta' });
            setMessage(generalMessage, 'Imagen lista para compartir.', 'success');
          } else {
            downloadBlob(blob, fileName);
            setMessage(generalMessage, 'Imagen descargada. Abre WhatsApp y adjuntala manualmente.', 'success');
          }
          resolve();
        } catch (error) {
          if (error.name !== 'AbortError') {
            setMessage(generalMessage, 'No fue posible compartir la imagen.');
          }
          reject();
        }
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      setMessage(generalMessage, 'No fue posible generar la imagen.');
      reject();
    };
    image.src = svgUrl;
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `divisor-cuentas-${getFileSafeName()}.json`);
  setMessage(generalMessage, 'Datos exportados como JSON.', 'success');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = normalizeAppState(JSON.parse(String(reader.result)));
      Object.assign(state, imported);
      state.activeBillId = imported.bills[0]?.id || imported.activeBillId;
      clearMessages();
      resetPersonForm();
      resetProductForm();
      persistAndRender('Datos importados correctamente.', 'success');
    } catch (error) {
      setMessage(generalMessage, 'El archivo JSON no tiene un formato valido.');
    }
  };

  reader.onerror = () => {
    setMessage(generalMessage, 'No fue posible leer el archivo seleccionado.');
  };

  reader.readAsText(file);
}

// Eventos
personForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessages();

  const activeBill = getActiveBill();
  const name = personNameInput.value.trim();
  const validationMessage = validatePersonName(name, activeBill, editingPersonId);
  if (validationMessage) {
    setMessage(personError, validationMessage);
    return;
  }

  if (editingPersonId) {
    const person = activeBill.people.find((item) => item.id === editingPersonId);
    if (!person) {
      setMessage(personError, 'No fue posible editar la persona.');
      return;
    }
    person.name = name;
  } else {
    activeBill.people.push({ id: crypto.randomUUID(), name });
  }

  resetPersonForm();
  personNameInput.focus();
  persistAndRender('Persona guardada correctamente.', 'success');
});

personCancelButton.addEventListener('click', () => {
  setMessage(personError, '');
  resetPersonForm();
});

productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessages();

  const activeBill = getActiveBill();
  const name = productNameInput.value.trim();
  const unitPrice = Number(productPriceInput.value);
  const quantity = Number(productQuantityInput.value);
  const splitMode = getSplitMode();
  const consumerSplits = collectConsumerSplits();

  const validationMessage = validateProductData(name, unitPrice, quantity, consumerSplits);
  if (validationMessage) {
    setMessage(productError, validationMessage);
    return;
  }

  const productData = {
    name,
    unitPrice,
    quantity,
    price: unitPrice * quantity,
    splitMode,
    consumerSplits,
  };

  if (editingProductId) {
    const product = activeBill.products.find((item) => item.id === editingProductId);
    if (!product) {
      setMessage(productError, 'No fue posible editar el producto.');
      return;
    }
    Object.assign(product, productData);
  } else {
    activeBill.products.push({ id: crypto.randomUUID(), ...productData });
  }

  resetProductForm();
  productNameInput.focus();
  persistAndRender('Producto guardado correctamente.', 'success');
});

productCancelButton.addEventListener('click', () => {
  setMessage(productError, '');
  resetProductForm();
});

selectAllConsumersButton.addEventListener('click', () => {
  const splitMode = getSplitMode();
  productConsumers.querySelectorAll('[data-consumer-check]').forEach((checkbox) => {
    checkbox.checked = true;
  });
  productConsumers.querySelectorAll('[data-consumer-share]').forEach((input) => {
    input.value = '1';
    input.disabled = splitMode !== 'weighted';
  });
});

productConsumers.addEventListener('input', (event) => {
  const checkbox = event.target.closest('[data-consumer-check]');
  if (!checkbox) {
    return;
  }

  const shareInput = productConsumers.querySelector(`[data-consumer-share="${checkbox.value}"]`);
  if (!shareInput) {
    return;
  }

  const splitMode = getSplitMode();
  shareInput.disabled = splitMode !== 'weighted' || !checkbox.checked;
  if (!checkbox.checked || splitMode !== 'weighted') {
    shareInput.value = '1';
  }
});

productForm.addEventListener('change', (event) => {
  if (!event.target.matches('input[name="splitMode"]')) {
    return;
  }

  const activeBill = getActiveBill();
  const selectedSplits = editingProductId
    ? activeBill.products.find((product) => product.id === editingProductId)?.consumerSplits ?? []
    : collectConsumerSplits();
  renderPeopleOptions(selectedSplits);
});

peopleList.addEventListener('click', (event) => {
  const activeBill = getActiveBill();
  const editButton = event.target.closest('[data-edit-person]');
  if (editButton) {
    const personId = editButton.getAttribute('data-edit-person');
    const person = activeBill.people.find((item) => item.id === personId);
    if (!person) {
      return;
    }

    setMessage(personError, '');
    editingPersonId = person.id;
    personNameInput.value = person.name;
    personSubmitButton.textContent = 'Guardar persona';
    personCancelButton.classList.remove('hidden');
    personNameInput.focus();
    return;
  }

  const removeButton = event.target.closest('[data-remove-person]');
  if (!removeButton) {
    return;
  }

  const personId = removeButton.getAttribute('data-remove-person');
  const person = activeBill.people.find((item) => item.id === personId);
  if (!person) {
    return;
  }

  const linkedProducts = getProductsLinkedToPerson(activeBill, personId);
  const confirmationText = linkedProducts.length > 0
    ? `${person.name} tiene productos asociados. Si la eliminas, se quitara de esos productos y algunos podrian desaparecer. ¿Deseas continuar?`
    : `¿Deseas eliminar a ${person.name}?`;

  if (!window.confirm(confirmationText)) {
    return;
  }

  pushUndo('Persona eliminada');
  activeBill.people = activeBill.people.filter((item) => item.id !== personId);
  if (editingPersonId === personId) {
    resetPersonForm();
  }

  for (let index = activeBill.products.length - 1; index >= 0; index -= 1) {
    activeBill.products[index].consumerSplits = activeBill.products[index].consumerSplits.filter((split) => split.personId !== personId);
    if (activeBill.products[index].consumerSplits.length === 0) {
      activeBill.products.splice(index, 1);
    }
  }

  persistAndRender('Persona eliminada correctamente.', 'success');
});

productsList.addEventListener('click', (event) => {
  const activeBill = getActiveBill();
  const editButton = event.target.closest('[data-edit-product]');
  if (editButton) {
    const productId = editButton.getAttribute('data-edit-product');
    const product = activeBill.products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setMessage(productError, '');
    editingProductId = product.id;
    productNameInput.value = product.name;
    productPriceInput.value = String(product.unitPrice);
    productQuantityInput.value = String(product.quantity);
    const selectedMode = productForm.querySelector(`input[name="splitMode"][value="${product.splitMode}"]`);
    if (selectedMode) {
      selectedMode.checked = true;
    }
    productSubmitButton.textContent = 'Guardar producto';
    productCancelButton.classList.remove('hidden');
    renderPeopleOptions(product.consumerSplits);
    productNameInput.focus();
    return;
  }

  const removeButton = event.target.closest('[data-remove-product]');
  if (!removeButton) {
    return;
  }

  const productId = removeButton.getAttribute('data-remove-product');
  pushUndo('Producto eliminado');
  activeBill.products = activeBill.products.filter((product) => product.id !== productId);
  if (editingProductId === productId) {
    resetProductForm();
  }
  persistAndRender('Producto eliminado correctamente.', 'success');
});

accountNameInput.addEventListener('input', () => {
  getActiveBill().accountName = accountNameInput.value;
  persistAndRender();
});

tipPercentageInput.addEventListener('input', () => {
  getActiveBill().tipPercentage = Math.max(0, Number(tipPercentageInput.value) || 0);
  persistAndRender();
});

billSelector.addEventListener('change', () => {
  state.activeBillId = billSelector.value;
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender();
});

newBillButton.addEventListener('click', () => {
  const rawName = window.prompt('Nombre para la nueva cuenta:', `Cuenta ${state.bills.length + 1}`);
  if (rawName === null) {
    return;
  }

  const bill = createEmptyBill(rawName.trim() || `Cuenta ${state.bills.length + 1}`);
  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender('Nueva cuenta creada.', 'success');
});

duplicateBillButton.addEventListener('click', () => {
  const clonedBill = duplicateBill(getActiveBill());
  state.bills.unshift(clonedBill);
  state.activeBillId = clonedBill.id;
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender('Cuenta duplicada.', 'success');
});

deleteBillButton.addEventListener('click', () => {
  if (state.bills.length <= 1) {
    setMessage(generalMessage, 'Debe existir al menos una cuenta guardada.');
    return;
  }

  if (!window.confirm('La cuenta seleccionada se eliminara permanentemente.')) {
    return;
  }

  pushUndo('Cuenta eliminada');
  state.bills = state.bills.filter((bill) => bill.id !== state.activeBillId);
  state.activeBillId = state.bills[0]?.id || '';
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender('Cuenta eliminada.', 'success');
});

themeToggleButton.addEventListener('click', () => {
  const themes = ['light', 'dark', 'system'];
  const currentIndex = themes.indexOf(state.theme);
  state.theme = themes[(currentIndex + 1) % themes.length];
  applyTheme();
  saveState();
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') {
    applyTheme();
  }
});

billHistory.addEventListener('click', (event) => {
  const button = event.target.closest('[data-history-bill]');
  if (!button) {
    return;
  }

  state.activeBillId = button.getAttribute('data-history-bill');
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender();
});

shareButton.addEventListener('click', async () => {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para compartir.');
    return;
  }

  const text = buildShareText(summary);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setMessage(generalMessage, 'Resumen copiado al portapapeles.', 'success');
      return;
    }
  } catch (error) {
    // Usa el respaldo si falla el portapapeles moderno.
  }

  if (copyTextFallback(text)) {
    setMessage(generalMessage, 'Resumen copiado al portapapeles.', 'success');
  } else {
    setMessage(generalMessage, 'No fue posible copiar el resumen.');
  }
});

function getShareableLink() {
  const activeBill = getActiveBill();
  const shareData = {
    n: activeBill.accountName,
    t: activeBill.tipPercentage,
    p: activeBill.people.map((person) => person.name),
    pr: activeBill.products.map((product) => ({
      n: product.name,
      u: product.unitPrice,
      q: product.quantity,
      s: product.splitMode,
      c: product.consumerSplits,
    })),
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
  const url = new URL(window.location.href);
  url.search = `?bill=${encoded}`;
  return url.toString();
}

shareLinkButton.addEventListener('click', async () => {
  const url = getShareableLink();
  try {
    await navigator.clipboard.writeText(url);
    setMessage(generalMessage, 'Enlace copiado. Compartilo para que otros vean la cuenta.', 'success');
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setMessage(generalMessage, 'Enlace copiado. Compartilo para que otros vean la cuenta.', 'success');
  }
});

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const billData = params.get('bill');
  if (!billData) return;

  try {
    const decoded = JSON.parse(decodeURIComponent(atob(billData)));
    const bill = createEmptyBill(decoded.n || 'Cuenta compartida');
    bill.tipPercentage = decoded.t || 10;
    bill.people = decoded.p.map((name, i) => ({ id: crypto.randomUUID(), name }));
    bill.products = decoded.pr.map((product) => ({
      id: crypto.randomUUID(),
      name: product.n,
      unitPrice: product.u,
      quantity: product.q,
      price: product.u * product.q,
      splitMode: product.s || 'equal',
      consumerSplits: product.c || [],
    }));
    bill.paidPeople = [];

    state.bills.unshift(bill);
    state.activeBillId = bill.id;
    saveState();

    window.history.replaceState({}, '', window.location.pathname);
    setMessage(generalMessage, 'Cuenta compartida cargada correctamente.', 'success');
  } catch (error) {
    console.error('Failed to load shared bill:', error);
  }
}

whatsAppButton.addEventListener('click', () => {
  shareImage();
});

svgButton.addEventListener('click', exportSvg);
pngButton.addEventListener('click', exportPng);
pdfButton.addEventListener('click', () => {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para exportar.');
    return;
  }

  setMessage(generalMessage, 'Se abrio la impresion del navegador para guardar en PDF.', 'success');
  window.print();
});

exportDataButton.addEventListener('click', exportData);
importDataButton.addEventListener('click', () => {
  importFileInput.value = '';
  importFileInput.click();
});
importFileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  importData(file);
});

resetButton.addEventListener('click', () => {
  if (!window.confirm('Se borraran personas, productos y totales de esta cuenta.')) {
    return;
  }

  pushUndo('Cuenta reiniciada');
  const activeBill = getActiveBill();
  activeBill.accountName = '';
  activeBill.tipPercentage = 10;
  activeBill.people = [];
  activeBill.products = [];
  activeBill.paidPeople = [];
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender('La cuenta fue reiniciada.', 'success');
});

results.addEventListener('change', (event) => {
  const checkbox = event.target.closest('[data-paid-person]');
  if (!checkbox) return;

  const personId = checkbox.getAttribute('data-paid-person');
  const activeBill = getActiveBill();
  if (!activeBill.paidPeople) activeBill.paidPeople = [];

  if (checkbox.checked) {
    if (!activeBill.paidPeople.includes(personId)) {
      activeBill.paidPeople.push(personId);
    }
  } else {
    activeBill.paidPeople = activeBill.paidPeople.filter((id) => id !== personId);
  }

  const resultCard = checkbox.closest('.result-card');
  const nameHeading = resultCard?.querySelector('.result-name');
  const paidBadge = resultCard?.querySelector('.paid-badge');

  if (resultCard) {
    resultCard.classList.toggle('paid', checkbox.checked);
    if (checkbox.checked && !paidBadge) {
      const badge = document.createElement('span');
      badge.className = 'paid-badge';
      badge.textContent = 'Pagado';
      nameHeading?.after(badge);
    } else if (!checkbox.checked && paidBadge) {
      paidBadge.remove();
    }
  }

  renderSummary();
  saveState();
});

clearPaymentsButton.addEventListener('click', () => {
  const activeBill = getActiveBill();
  if (!activeBill.paidPeople || activeBill.paidPeople.length === 0) {
    return;
  }
  if (!window.confirm('¿Limpiar todos los pagos?')) {
    return;
  }
  pushUndo('Pagos limpiados');
  activeBill.paidPeople = [];
  persistAndRender('Pagos limpiados.', 'success');
});

undoActionButton.addEventListener('click', performUndo);

loadState();
loadFromUrl();

if (window.matchMedia('(display-mode: standalone)').matches) {
  installButton.style.display = 'none';
  installPromptButton.style.display = 'none';
} else {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'inline-flex';
    installPromptButton.style.display = 'inline-flex';
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installButton.style.display = 'none';
      installPromptButton.style.display = 'none';
    }
    deferredPrompt = null;
  });

  installPromptButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installButton.style.display = 'none';
      installPromptButton.style.display = 'none';
    }
    deferredPrompt = null;
  });
}

applyTheme();
getActiveBill();
resetPersonForm();
resetProductForm();
render();
