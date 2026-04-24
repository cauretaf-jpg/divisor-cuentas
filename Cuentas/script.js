const STORAGE_KEY = 'divisor-cuentas-app';
const LEGACY_STORAGE_KEY = 'divisor-cuentas-state';

const state = {
  theme: 'light',
  activeBillId: '',
  bills: [],
};

let editingPersonId = null;
let editingProductId = null;

const themeToggleButton = document.querySelector('#themeToggleButton');
const billSelector = document.querySelector('#billSelector');
const newBillButton = document.querySelector('#newBillButton');
const duplicateBillButton = document.querySelector('#duplicateBillButton');
const deleteBillButton = document.querySelector('#deleteBillButton');
const billHistory = document.querySelector('#billHistory');

const accountNameInput = document.querySelector('#accountName');
const tipPercentageInput = document.querySelector('#tipPercentage');
const shareButton = document.querySelector('#shareButton');
const whatsAppButton = document.querySelector('#whatsAppButton');
const imageButton = document.querySelector('#imageButton');
const pdfButton = document.querySelector('#pdfButton');
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

function createEmptyBill(name = 'Nueva cuenta') {
  return {
    id: crypto.randomUUID(),
    accountName: name,
    tipPercentage: 10,
    people: [],
    products: [],
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
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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
  document.documentElement.dataset.theme = state.theme;
  themeToggleButton.textContent = state.theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
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
    return {
      theme: 'light',
      activeBillId: '',
      bills: [{
        id: crypto.randomUUID(),
        accountName: typeof parsed.accountName === 'string' ? parsed.accountName : 'Cuenta migrada',
        tipPercentage: Number.isFinite(Number(parsed.tipPercentage)) ? Math.max(0, Number(parsed.tipPercentage)) : 10,
        people: Array.isArray(parsed.people) ? parsed.people : [],
        products: Array.isArray(parsed.products)
          ? parsed.products.map((product) => ({
              id: product.id || crypto.randomUUID(),
              name: product.name,
              unitPrice: Number(product.unitPrice ?? product.price) || 0,
              quantity: Number(product.quantity) || 1,
              price: (Number(product.unitPrice ?? product.price) || 0) * (Number(product.quantity) || 1),
              consumerSplits: Array.isArray(product.consumerSplits)
                ? product.consumerSplits
                : Array.isArray(product.consumerIds)
                  ? product.consumerIds.map((consumerId) => ({ personId: consumerId, share: 1 }))
                  : [],
              splitMode: product.splitMode || 'equal',
            }))
          : [],
      }],
    };
  } catch (error) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.theme = parsed.theme === 'dark' ? 'dark' : 'light';
      state.activeBillId = typeof parsed.activeBillId === 'string' ? parsed.activeBillId : '';
      state.bills = Array.isArray(parsed.bills)
        ? parsed.bills.map((bill) => ({
            id: bill.id || crypto.randomUUID(),
            accountName: typeof bill.accountName === 'string' ? bill.accountName : '',
            tipPercentage: Number.isFinite(Number(bill.tipPercentage)) ? Math.max(0, Number(bill.tipPercentage)) : 10,
            people: Array.isArray(bill.people) ? bill.people : [],
            products: Array.isArray(bill.products)
              ? bill.products.map((product) => ({
                  id: product.id || crypto.randomUUID(),
                  name: product.name,
                  unitPrice: Number(product.unitPrice ?? product.price) || 0,
                  quantity: Number(product.quantity) || 1,
                  price: (Number(product.unitPrice ?? product.price) || 0) * (Number(product.quantity) || 1),
                  consumerSplits: Array.isArray(product.consumerSplits)
                    ? product.consumerSplits
                    : Array.isArray(product.consumerIds)
                      ? product.consumerIds.map((consumerId) => ({ personId: consumerId, share: 1 }))
                      : [],
                  splitMode: product.splitMode === 'weighted' ? 'weighted' : 'equal',
                }))
              : [],
          }))
        : [];
      return;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const legacy = loadLegacyState();
  if (legacy) {
    state.theme = legacy.theme;
    state.bills = legacy.bills;
    state.activeBillId = legacy.bills[0]?.id || '';
    saveState();
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

function resetPersonForm() {
  editingPersonId = null;
  personForm.reset();
  personSubmitButton.textContent = 'Agregar';
  personCancelButton.classList.add('hidden');
}

function resetProductForm() {
  editingProductId = null;
  productForm.reset();
  productQuantityInput.value = '1';
  productSubmitButton.textContent = 'Agregar producto';
  productCancelButton.classList.add('hidden');
  const equalMode = productForm.querySelector('input[name="splitMode"][value="equal"]');
  if (equalMode) {
    equalMode.checked = true;
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
    return;
  }

  const splitLookup = new Map(selectedSplits.map((item) => [item.personId, item.share]));
  const splitMode = editingProductId
    ? activeBill.products.find((product) => product.id === editingProductId)?.splitMode || getSplitMode()
    : getSplitMode();

  productConsumers.className = 'consumer-grid';
  productConsumers.innerHTML = activeBill.people.map((person) => {
    const selected = splitLookup.has(person.id);
    const share = splitLookup.get(person.id) || 1;

    return `
      <label class="consumer-card">
        <input type="checkbox" data-consumer-check value="${escapeHtml(person.id)}" ${selected ? 'checked' : ''}>
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          <div class="item-detail">${splitMode === 'equal' ? 'Se divide igual entre seleccionados.' : 'Define cuántas partes le corresponden.'}</div>
        </div>
        <div class="share-wrap">
          <span>Partes</span>
          <input class="share-input" type="number" min="1" step="1" value="${share}" data-consumer-share="${escapeHtml(person.id)}" ${selected ? '' : 'disabled'}>
        </div>
      </label>
    `;
  }).join('');

  if (splitMode === 'equal') {
    productConsumers.querySelectorAll('[data-consumer-share]').forEach((input) => {
      input.value = '1';
      input.disabled = true;
    });
    productConsumers.querySelectorAll('[data-consumer-check]:checked').forEach((checkbox) => {
      const shareInput = productConsumers.querySelector(`[data-consumer-share="${checkbox.value}"]`);
      if (shareInput) {
        shareInput.disabled = true;
      }
    });
  }
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

function formatConsumerBreakdown(product, people) {
  return product.consumerSplits.map((split) => {
    const name = people.find((person) => person.id === split.personId)?.name || 'Sin nombre';
    return `${name} x${split.share}`;
  }).join(', ');
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
        <p class="item-detail">${product.splitMode === 'equal' ? 'Reparto igual' : 'Reparto proporcional'}: ${escapeHtml(formatConsumerBreakdown(product, activeBill.people))}</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost-button" data-edit-product="${escapeHtml(product.id)}">Editar</button>
        <button type="button" class="ghost-button" data-remove-product="${escapeHtml(product.id)}">Eliminar</button>
      </div>
    </li>
  `).join('');
}

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
        share: product.splitMode === 'equal' ? 1 : split.share,
        person: totalsByPerson.find((item) => item.id === split.personId),
      }))
      .filter((item) => item.person);

    const totalShares = participants.reduce((sum, item) => sum + item.share, 0);
    if (totalShares <= 0) {
      return;
    }

    participants.forEach((participant) => {
      const value = product.price * (participant.share / totalShares);
      participant.person.subtotal += value;
      participant.person.items.push({
        label: `${product.name} (${product.quantity} x ${formatCurrency(product.unitPrice)})`,
        value,
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

function buildShareText(summary = calculateSummary()) {
  const activeBill = getActiveBill();
  const lines = [getAccountTitle(), `Propina: ${activeBill.tipPercentage}%`, ''];

  summary.totalsByPerson.forEach((person) => {
    lines.push(`${person.name}: ${formatCurrency(person.total)}`);
    person.items.forEach((item) => {
      const detail = item.splitMode === 'weighted' ? `, parte ${item.share}` : '';
      lines.push(`- ${item.label}${detail}: ${formatCurrency(item.value)}`);
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

function renderSummary() {
  const activeBill = getActiveBill();
  const summary = calculateSummary();

  accountHeading.textContent = getAccountTitle();
  subtotalValue.textContent = formatCurrency(summary.subtotal);
  tipValue.textContent = `${formatCurrency(summary.tipAmount)} (${activeBill.tipPercentage}%)`;
  grandTotalValue.textContent = formatCurrency(summary.grandTotal);

  if (summary.totalsByPerson.length === 0 || activeBill.products.length === 0) {
    results.className = 'results empty-state';
    results.textContent = 'Agrega personas y productos para ver el cálculo.';
    return;
  }

  results.className = 'results';
  results.innerHTML = summary.totalsByPerson.map((person) => {
    const itemsHtml = person.items.length > 0
      ? person.items.map((item) => `
          <div class="breakdown-item">
            <span>${escapeHtml(item.label)}${item.splitMode === 'weighted' ? ` · parte ${item.share}` : ''}</span>
            <strong>${formatCurrency(item.value)}</strong>
          </div>
        `).join('')
      : '<p class="item-detail">Sin productos asignados.</p>';

    return `
      <article class="result-card">
        <h3 class="result-name">${escapeHtml(person.name)}</h3>
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

function persistAndRender() {
  saveState();
  render();
}

function collectConsumerSplits() {
  const splitMode = getSplitMode();
  const checks = Array.from(productConsumers.querySelectorAll('[data-consumer-check]:checked'));

  return checks.map((checkbox) => {
    const shareInput = productConsumers.querySelector(`[data-consumer-share="${checkbox.value}"]`);
    return {
      personId: checkbox.value,
      share: splitMode === 'equal' ? 1 : Math.max(1, Number(shareInput?.value) || 1),
    };
  });
}

personForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessages();

  const activeBill = getActiveBill();
  const name = personNameInput.value.trim();
  if (!name) {
    setMessage(personError, 'Debes ingresar un nombre.');
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
  persistAndRender();
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

  if (!name) {
    setMessage(productError, 'Debes ingresar un producto.');
    return;
  }

  if (unitPrice <= 0) {
    setMessage(productError, 'El valor debe ser mayor a 0.');
    return;
  }

  if (quantity <= 0) {
    setMessage(productError, 'La cantidad debe ser mayor a 0.');
    return;
  }

  if (consumerSplits.length === 0) {
    setMessage(productError, 'Debes seleccionar al menos una persona.');
    return;
  }

  if (splitMode === 'weighted' && consumerSplits.some((item) => item.share <= 0)) {
    setMessage(productError, 'Las partes deben ser mayores a 0.');
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
  persistAndRender();
});

productCancelButton.addEventListener('click', () => {
  setMessage(productError, '');
  resetProductForm();
});

productConsumers.addEventListener('input', (event) => {
  const checkbox = event.target.closest('[data-consumer-check]');
  if (checkbox) {
    const shareInput = productConsumers.querySelector(`[data-consumer-share="${checkbox.value}"]`);
    if (shareInput) {
      const splitMode = getSplitMode();
      shareInput.disabled = splitMode === 'equal' || !checkbox.checked;
      if (!checkbox.checked || splitMode === 'equal') {
        shareInput.value = '1';
      }
    }
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
    personSubmitButton.textContent = 'Guardar';
    personCancelButton.classList.remove('hidden');
    personNameInput.focus();
    return;
  }

  const removeButton = event.target.closest('[data-remove-person]');
  if (!removeButton) {
    return;
  }

  const personId = removeButton.getAttribute('data-remove-person');
  const personIndex = activeBill.people.findIndex((person) => person.id === personId);
  if (personIndex === -1) {
    return;
  }

  activeBill.people.splice(personIndex, 1);
  if (editingPersonId === personId) {
    resetPersonForm();
  }

  for (let index = activeBill.products.length - 1; index >= 0; index -= 1) {
    activeBill.products[index].consumerSplits = activeBill.products[index].consumerSplits.filter((split) => split.personId !== personId);
    if (activeBill.products[index].consumerSplits.length === 0) {
      activeBill.products.splice(index, 1);
    }
  }

  persistAndRender();
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
  const productIndex = activeBill.products.findIndex((product) => product.id === productId);
  if (productIndex === -1) {
    return;
  }

  activeBill.products.splice(productIndex, 1);
  if (editingProductId === productId) {
    resetProductForm();
  }
  persistAndRender();
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

  const name = rawName.trim();

  const bill = createEmptyBill(name || `Cuenta ${state.bills.length + 1}`);
  state.bills.push(bill);
  state.activeBillId = bill.id;
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender();
  setMessage(generalMessage, 'Nueva cuenta creada.', 'success');
});

duplicateBillButton.addEventListener('click', () => {
  const activeBill = getActiveBill();
  const clonedBill = duplicateBill(activeBill);
  state.bills.unshift(clonedBill);
  state.activeBillId = clonedBill.id;
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender();
  setMessage(generalMessage, 'Cuenta duplicada.', 'success');
});

deleteBillButton.addEventListener('click', () => {
  if (state.bills.length <= 1) {
    setMessage(generalMessage, 'Debe existir al menos una cuenta guardada.');
    return;
  }

  const confirmed = window.confirm('La cuenta seleccionada se eliminará permanentemente.');
  if (!confirmed) {
    return;
  }

  state.bills = state.bills.filter((bill) => bill.id !== state.activeBillId);
  state.activeBillId = state.bills[0]?.id || '';
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender();
  setMessage(generalMessage, 'Cuenta eliminada.', 'success');
});

themeToggleButton.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  persistAndRender();
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

whatsAppButton.addEventListener('click', () => {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para compartir.');
    return;
  }

  const message = encodeURIComponent(buildShareText(summary));
  window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener');
  setMessage(generalMessage, 'Se abrió WhatsApp con el resumen.', 'success');
});

imageButton.addEventListener('click', () => {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para exportar.');
    return;
  }

  const lines = buildShareText(summary).split('\n').slice(1);
  const lineHeight = 24;
  const width = 980;
  const height = 110 + (lines.length * lineHeight);
  const textNodes = lines.map((line, index) => `<text x="40" y="${66 + (index * lineHeight)}" font-size="18" font-family="Arial, Helvetica, sans-serif" fill="${state.theme === 'dark' ? '#f5ece5' : '#2a211c'}">${escapeXml(line)}</text>`).join('');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${state.theme === 'dark' ? '#2a201c' : '#fffdfa'}" rx="26" ry="26" />
      <text x="40" y="38" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="${state.theme === 'dark' ? '#ffc49f' : '#8f4218'}">${escapeXml(getAccountTitle())}</text>
      ${textNodes}
    </svg>
  `;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${getAccountTitle().replace(/\s+/g, '-').toLowerCase() || 'cuenta'}.svg`;
  link.click();
  URL.revokeObjectURL(url);
  setMessage(generalMessage, 'Imagen exportada como SVG.', 'success');
});

pdfButton.addEventListener('click', () => {
  const summary = calculateSummary();
  if (summary.totalsByPerson.length === 0 || getActiveBill().products.length === 0) {
    setMessage(generalMessage, 'No hay datos suficientes para exportar.');
    return;
  }

  setMessage(generalMessage, 'Se abrió la impresión del navegador para guardar en PDF.', 'success');
  window.print();
});

resetButton.addEventListener('click', () => {
  const confirmed = window.confirm('Se borrarán personas, productos y totales de esta cuenta.');
  if (!confirmed) {
    return;
  }

  const activeBill = getActiveBill();
  activeBill.accountName = '';
  activeBill.tipPercentage = 10;
  activeBill.people = [];
  activeBill.products = [];
  clearMessages();
  resetPersonForm();
  resetProductForm();
  persistAndRender();
  setMessage(generalMessage, 'La cuenta fue reiniciada.', 'success');
});

loadState();
applyTheme();
getActiveBill();
resetPersonForm();
resetProductForm();
render();
