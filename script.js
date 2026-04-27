const STORAGE_KEY = 'cuenta-clara-v1-state';
const THEME_KEY = 'cuenta-clara-theme';

const dom = {
  themeToggle: document.querySelector('#themeToggle'),
  newBillButton: document.querySelector('#newBillButton'),
  duplicateBillButton: document.querySelector('#duplicateBillButton'),
  deleteBillButton: document.querySelector('#deleteBillButton'),
  billList: document.querySelector('#billList'),
  billNameInput: document.querySelector('#billNameInput'),
  billMeta: document.querySelector('#billMeta'),

  personForm: document.querySelector('#personForm'),
  personNameInput: document.querySelector('#personNameInput'),
  peopleList: document.querySelector('#peopleList'),

  tipPercentInput: document.querySelector('#tipPercentInput'),
  quickTipButtons: document.querySelectorAll('[data-tip]'),

  productForm: document.querySelector('#productForm'),
  productFormTitle: document.querySelector('#productFormTitle'),
  productNameInput: document.querySelector('#productNameInput'),
  productPriceInput: document.querySelector('#productPriceInput'),
  productQuantityInput: document.querySelector('#productQuantityInput'),
  consumerList: document.querySelector('#consumerList'),
  selectAllConsumersButton: document.querySelector('#selectAllConsumersButton'),
  cancelEditProductButton: document.querySelector('#cancelEditProductButton'),
  productSubmitButton: document.querySelector('#productSubmitButton'),
  productList: document.querySelector('#productList'),

  subtotalOutput: document.querySelector('#subtotalOutput'),
  tipOutput: document.querySelector('#tipOutput'),
  grandTotalOutput: document.querySelector('#grandTotalOutput'),
  paidTotalOutput: document.querySelector('#paidTotalOutput'),
  pendingTotalOutput: document.querySelector('#pendingTotalOutput'),
  personResults: document.querySelector('#personResults'),
  copySummaryButton: document.querySelector('#copySummaryButton'),
  whatsappButton: document.querySelector('#whatsappButton'),
  shareButton: document.querySelector('#shareButton'),

  shareModal: document.querySelector('#shareModal'),
  closeShareModalButton: document.querySelector('#closeShareModalButton'),
  sharePreviewType: document.querySelector('#sharePreviewType'),
  textPreview: document.querySelector('#textPreview'),
  imagePreviewWrap: document.querySelector('#imagePreviewWrap'),
  shareCanvas: document.querySelector('#shareCanvas'),
  copySelectedShareButton: document.querySelector('#copySelectedShareButton'),
  whatsappSelectedShareButton: document.querySelector('#whatsappSelectedShareButton'),
  downloadImageButton: document.querySelector('#downloadImageButton'),
  nativeShareImageButton: document.querySelector('#nativeShareImageButton'),

  noticeTab: document.querySelector('#noticeTab'),
  noticeTitle: document.querySelector('#noticeTitle'),
  noticeMessage: document.querySelector('#noticeMessage'),
  closeNoticeTabButton: document.querySelector('#closeNoticeTabButton'),
  toast: document.querySelector('#toast'),
  emptyStateTemplate: document.querySelector('#emptyStateTemplate'),
};

let state = {
  bills: [],
  activeBillId: null,
};

let editingProductId = null;
let toastTimer = null;
let noticeTimer = null;

function createId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

function formatDate(iso) {
  if (!iso) return '';

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function makeDefaultBill() {
  const createdAt = nowIso();

  return {
    id: createId('bill'),
    name: 'Nueva cuenta',
    tipPercent: 10,
    createdAt,
    updatedAt: createdAt,
    people: [
      { id: createId('person'), name: 'Carlos', paid: false },
      { id: createId('person'), name: 'Vale', paid: false },
    ],
    products: [],
  };
}

function normalizeState(input) {
  if (!input || !Array.isArray(input.bills)) {
    const bill = makeDefaultBill();
    return { bills: [bill], activeBillId: bill.id };
  }

  const bills = input.bills.map((bill) => ({
    id: bill.id || createId('bill'),
    name: String(bill.name || 'Cuenta sin nombre'),
    tipPercent: Number.isFinite(Number(bill.tipPercent)) ? Number(bill.tipPercent) : 10,
    createdAt: bill.createdAt || nowIso(),
    updatedAt: bill.updatedAt || bill.createdAt || nowIso(),
    people: Array.isArray(bill.people)
      ? bill.people.map((person) => ({
          id: person.id || createId('person'),
          name: String(person.name || 'Persona'),
          paid: Boolean(person.paid),
        }))
      : [],
    products: Array.isArray(bill.products)
      ? bill.products.map((product) => ({
          id: product.id || createId('product'),
          name: String(product.name || 'Producto'),
          unitPrice: Number(product.unitPrice ?? product.price ?? 0),
          quantity: Number(product.quantity ?? 1),
          consumers: Array.isArray(product.consumers)
            ? product.consumers.map((consumer) => ({
                personId: consumer.personId,
                share: Math.max(1, Number(consumer.share || 1)),
              }))
            : [],
        }))
      : [],
  }));

  if (bills.length === 0) {
    const bill = makeDefaultBill();
    return { bills: [bill], activeBillId: bill.id };
  }

  const activeBillId = bills.some((bill) => bill.id === input.activeBillId)
    ? input.activeBillId
    : bills[0].id;

  return { bills, activeBillId };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    state = normalizeState(saved);
  } catch {
    state = normalizeState(null);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveBill() {
  return state.bills.find((bill) => bill.id === state.activeBillId) || state.bills[0];
}

function touchActiveBill() {
  const bill = getActiveBill();
  bill.updatedAt = nowIso();
}

function persistAndRender() {
  touchActiveBill();
  saveState();
  render();
}

function showToast(message) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add('show');

  toastTimer = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 2200);
}

function showNotice(title, message) {
  clearTimeout(noticeTimer);
  dom.noticeTitle.textContent = title;
  dom.noticeMessage.textContent = message;
  dom.noticeTab.classList.remove('hidden');

  noticeTimer = setTimeout(() => {
    dom.noticeTab.classList.add('hidden');
  }, 5200);
}

function cloneEmptyState() {
  return dom.emptyStateTemplate.content.cloneNode(true);
}

function calculateBill(bill = getActiveBill()) {
  const baseTotals = Object.fromEntries(bill.people.map((person) => [person.id, 0]));
  const personDetails = Object.fromEntries(
    bill.people.map((person) => [
      person.id,
      {
        person,
        items: [],
        subtotal: 0,
        tip: 0,
        total: 0,
      },
    ])
  );

  for (const product of bill.products) {
    const validConsumers = product.consumers.filter((consumer) =>
      bill.people.some((person) => person.id === consumer.personId)
    );

    const totalShares = validConsumers.reduce((sum, consumer) => sum + Math.max(1, Number(consumer.share || 1)), 0);

    if (totalShares <= 0) {
      continue;
    }

    const productTotal = Number(product.unitPrice) * Number(product.quantity);

    for (const consumer of validConsumers) {
      const share = Math.max(1, Number(consumer.share || 1));
      const amount = productTotal * (share / totalShares);

      baseTotals[consumer.personId] += amount;

      if (personDetails[consumer.personId]) {
        personDetails[consumer.personId].items.push({
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.unitPrice),
          quantity: Number(product.quantity),
          productTotal,
          share,
          totalShares,
          amount,
        });
      }
    }
  }

  const subtotal = Object.values(baseTotals).reduce((sum, value) => sum + value, 0);
  const tipPercent = Number(bill.tipPercent) || 0;
  const tipAmount = subtotal * (tipPercent / 100);
  const finalTotals = {};
  let paidTotal = 0;
  let pendingTotal = 0;

  for (const person of bill.people) {
    const personSubtotal = baseTotals[person.id] || 0;
    const personTip = personSubtotal * (tipPercent / 100);
    const finalAmount = personSubtotal + personTip;

    finalTotals[person.id] = finalAmount;
    personDetails[person.id].subtotal = personSubtotal;
    personDetails[person.id].tip = personTip;
    personDetails[person.id].total = finalAmount;

    if (person.paid) {
      paidTotal += finalAmount;
    } else {
      pendingTotal += finalAmount;
    }
  }

  return {
    subtotal,
    tipAmount,
    grandTotal: subtotal + tipAmount,
    paidTotal,
    pendingTotal,
    baseTotals,
    finalTotals,
    personDetails,
  };
}

function renderBillList() {
  dom.billList.innerHTML = '';

  for (const bill of state.bills) {
    const calculation = calculateBill(bill);
    const button = document.createElement('button');
    button.className = `bill-item ${bill.id === state.activeBillId ? 'active' : ''}`;
    button.type = 'button';
    button.innerHTML = `
      <div>
        <strong>${escapeHtml(bill.name)}</strong>
        <span>${formatCurrency(calculation.grandTotal)} · ${bill.people.length} personas</span>
        <span>${formatDate(bill.updatedAt)}</span>
      </div>
      <span class="bill-count">${bill.products.length}</span>
    `;

    button.addEventListener('click', () => {
      state.activeBillId = bill.id;
      editingProductId = null;
      saveState();
      render();
    });

    dom.billList.appendChild(button);
  }
}

function renderBillHeader() {
  const bill = getActiveBill();

  dom.billNameInput.value = bill.name;
  dom.billMeta.textContent = `Creada: ${formatDate(bill.createdAt)} · Última edición: ${formatDate(bill.updatedAt)}`;
  dom.tipPercentInput.value = bill.tipPercent;
  dom.deleteBillButton.disabled = state.bills.length <= 1;
}

function renderPeople() {
  const bill = getActiveBill();
  dom.peopleList.innerHTML = '';

  if (bill.people.length === 0) {
    dom.peopleList.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const row = document.createElement('div');
    row.className = 'person-row';
    row.innerHTML = `
      <strong>${escapeHtml(person.name)}</strong>
      <button class="paid-toggle ${person.paid ? 'is-paid' : ''}" type="button">
        ${person.paid ? 'Pagado' : 'Pendiente'}
      </button>
      <button class="icon-button danger" type="button" aria-label="Eliminar ${escapeHtml(person.name)}">×</button>
    `;

    row.querySelector('.paid-toggle').addEventListener('click', () => {
      person.paid = !person.paid;
      persistAndRender();
    });

    row.querySelector('.icon-button').addEventListener('click', () => {
      deletePerson(person.id);
    });

    row.querySelector('strong').addEventListener('dblclick', () => {
      renamePerson(person.id);
    });

    dom.peopleList.appendChild(row);
  }
}

function renderConsumers() {
  const bill = getActiveBill();
  const currentProduct = editingProductId
    ? bill.products.find((product) => product.id === editingProductId)
    : null;

  dom.consumerList.innerHTML = '';

  if (bill.people.length === 0) {
    dom.consumerList.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const existing = currentProduct?.consumers.find((consumer) => consumer.personId === person.id);
    const checked = currentProduct ? Boolean(existing) : true;
    const share = existing?.share || 1;

    const row = document.createElement('label');
    row.className = 'consumer-row';
    row.innerHTML = `
      <input type="checkbox" value="${person.id}" ${checked ? 'checked' : ''} />
      <span>${escapeHtml(person.name)}</span>
      <input type="number" min="1" step="1" value="${share}" aria-label="Partes de ${escapeHtml(person.name)}" />
    `;

    const checkbox = row.querySelector('input[type="checkbox"]');
    const shareInput = row.querySelector('input[type="number"]');

    shareInput.disabled = !checkbox.checked;

    checkbox.addEventListener('change', () => {
      shareInput.disabled = !checkbox.checked;
    });

    dom.consumerList.appendChild(row);
  }
}

function renderProducts() {
  const bill = getActiveBill();
  dom.productList.innerHTML = '';

  if (bill.products.length === 0) {
    dom.productList.appendChild(cloneEmptyState());
    return;
  }

  for (const product of bill.products) {
    const productTotal = Number(product.unitPrice) * Number(product.quantity);
    const consumerNames = product.consumers
      .map((consumer) => {
        const person = bill.people.find((item) => item.id === consumer.personId);
        return person ? `${person.name}${consumer.share > 1 ? ` (${consumer.share} partes)` : ''}` : null;
      })
      .filter(Boolean)
      .join(', ');

    const row = document.createElement('article');
    row.className = 'product-row';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <div class="product-meta">
          ${formatCurrency(product.unitPrice)} × ${product.quantity} = ${formatCurrency(productTotal)}
          <br />
          Consumidores: ${escapeHtml(consumerNames || 'Sin consumidores')}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-light btn-small" data-action="edit" type="button">Editar</button>
        <button class="btn btn-danger-light btn-small" data-action="delete" type="button">Eliminar</button>
      </div>
    `;

    row.querySelector('[data-action="edit"]').addEventListener('click', () => {
      startEditProduct(product.id);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteProduct(product.id);
    });

    dom.productList.appendChild(row);
  }
}

function renderProductForm() {
  if (!editingProductId) {
    dom.productFormTitle.textContent = 'Agregar producto';
    dom.productSubmitButton.textContent = 'Agregar producto';
    dom.cancelEditProductButton.classList.add('hidden');
    renderConsumers();
    return;
  }

  const bill = getActiveBill();
  const product = bill.products.find((item) => item.id === editingProductId);

  if (!product) {
    editingProductId = null;
    renderProductForm();
    return;
  }

  dom.productFormTitle.textContent = 'Editar producto';
  dom.productSubmitButton.textContent = 'Guardar cambios';
  dom.cancelEditProductButton.classList.remove('hidden');

  dom.productNameInput.value = product.name;
  dom.productPriceInput.value = product.unitPrice;
  dom.productQuantityInput.value = product.quantity;

  renderConsumers();
}

function renderTotals() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);

  dom.subtotalOutput.textContent = formatCurrency(calculation.subtotal);
  dom.tipOutput.textContent = formatCurrency(calculation.tipAmount);
  dom.grandTotalOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.paidTotalOutput.textContent = formatCurrency(calculation.paidTotal);
  dom.pendingTotalOutput.textContent = formatCurrency(calculation.pendingTotal);

  dom.personResults.innerHTML = '';

  if (bill.people.length === 0) {
    dom.personResults.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <span>${escapeHtml(person.name)} · ${person.paid ? 'Pagado' : 'Pendiente'}</span>
      <strong>${formatCurrency(calculation.finalTotals[person.id] || 0)}</strong>
    `;
    dom.personResults.appendChild(row);
  }
}

function render() {
  renderBillList();
  renderBillHeader();
  renderPeople();
  renderProductForm();
  renderProducts();
  renderTotals();

  if (!dom.shareModal.classList.contains('hidden')) {
    updateSharePreview();
  }
}

function addBill() {
  const bill = makeDefaultBill();
  bill.name = `Cuenta ${state.bills.length + 1}`;
  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  editingProductId = null;
  saveState();
  render();
  showToast('Cuenta creada.');
}

function duplicateBill() {
  const bill = getActiveBill();
  const personMap = new Map();
  const newPeople = bill.people.map((person) => {
    const newId = createId('person');
    personMap.set(person.id, newId);
    return { ...person, id: newId, paid: false };
  });

  const createdAt = nowIso();
  const clonedBill = {
    ...bill,
    id: createId('bill'),
    name: `${bill.name} copia`,
    createdAt,
    updatedAt: createdAt,
    people: newPeople,
    products: bill.products.map((product) => ({
      ...product,
      id: createId('product'),
      consumers: product.consumers
        .filter((consumer) => personMap.has(consumer.personId))
        .map((consumer) => ({
          personId: personMap.get(consumer.personId),
          share: consumer.share,
        })),
    })),
  };

  state.bills.unshift(clonedBill);
  state.activeBillId = clonedBill.id;
  editingProductId = null;
  saveState();
  render();
  showToast('Cuenta duplicada.');
}

function deleteActiveBill() {
  if (state.bills.length <= 1) {
    showToast('Debe existir al menos una cuenta.');
    return;
  }

  const bill = getActiveBill();
  const confirmed = confirm(`¿Eliminar "${bill.name}"? Esta acción no se puede deshacer.`);

  if (!confirmed) {
    return;
  }

  state.bills = state.bills.filter((item) => item.id !== bill.id);
  state.activeBillId = state.bills[0].id;
  editingProductId = null;
  saveState();
  render();
  showToast('Cuenta eliminada.');
}

function addPerson(name) {
  const bill = getActiveBill();
  const cleanName = name.trim();

  if (!cleanName) {
    showToast('Ingresa un nombre.');
    return;
  }

  const exists = bill.people.some((person) => person.name.toLowerCase() === cleanName.toLowerCase());

  if (exists) {
    showNotice('Nombre repetido', 'Ya existe una persona con ese nombre en esta cuenta. Usa un apellido, apodo o inicial para diferenciarla.');
    return;
  }

  bill.people.push({
    id: createId('person'),
    name: cleanName,
    paid: false,
  });

  dom.personNameInput.value = '';
  persistAndRender();
}

function deletePerson(personId) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    return;
  }

  const confirmed = confirm(`¿Eliminar a ${person.name}? También se quitará de los productos compartidos.`);

  if (!confirmed) {
    return;
  }

  bill.people = bill.people.filter((item) => item.id !== personId);
  bill.products = bill.products.map((product) => ({
    ...product,
    consumers: product.consumers.filter((consumer) => consumer.personId !== personId),
  }));

  persistAndRender();
}

function renamePerson(personId) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    return;
  }

  const newName = prompt('Nuevo nombre:', person.name);

  if (newName === null) {
    return;
  }

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast('El nombre no puede quedar vacío.');
    return;
  }

  const exists = bill.people.some(
    (item) => item.id !== personId && item.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (exists) {
    showNotice('Nombre repetido', 'Ya existe una persona con ese nombre. Usa un apellido, apodo o inicial para diferenciarla.');
    return;
  }

  person.name = cleanName;
  persistAndRender();
}

function getConsumersFromForm() {
  return [...dom.consumerList.querySelectorAll('.consumer-row')]
    .map((row) => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      const shareInput = row.querySelector('input[type="number"]');

      return {
        personId: checkbox.value,
        checked: checkbox.checked,
        share: Math.max(1, Number(shareInput.value || 1)),
      };
    })
    .filter((consumer) => consumer.checked)
    .map(({ personId, share }) => ({ personId, share }));
}

function submitProduct() {
  const bill = getActiveBill();
  const name = dom.productNameInput.value.trim();
  const unitPrice = Number(dom.productPriceInput.value);
  const quantity = Number(dom.productQuantityInput.value);
  const consumers = getConsumersFromForm();

  if (!name) {
    showToast('Ingresa el nombre del producto.');
    return;
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    showToast('Ingresa un precio unitario mayor a cero.');
    return;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    showToast('Ingresa una cantidad mayor a cero.');
    return;
  }

  if (consumers.length === 0) {
    showToast('Selecciona al menos una persona.');
    return;
  }

  if (editingProductId) {
    const product = bill.products.find((item) => item.id === editingProductId);

    if (product) {
      product.name = name;
      product.unitPrice = unitPrice;
      product.quantity = quantity;
      product.consumers = consumers;
    }

    editingProductId = null;
    showToast('Producto actualizado.');
  } else {
    bill.products.push({
      id: createId('product'),
      name,
      unitPrice,
      quantity,
      consumers,
    });

    showToast('Producto agregado.');
  }

  resetProductForm();
  persistAndRender();
}

function startEditProduct(productId) {
  editingProductId = productId;
  renderProductForm();
  dom.productNameInput.focus();
  window.scrollTo({ top: dom.productForm.offsetTop - 110, behavior: 'smooth' });
}

function deleteProduct(productId) {
  const bill = getActiveBill();
  const product = bill.products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const confirmed = confirm(`¿Eliminar "${product.name}"?`);

  if (!confirmed) {
    return;
  }

  bill.products = bill.products.filter((item) => item.id !== productId);

  if (editingProductId === productId) {
    editingProductId = null;
    resetProductForm();
  }

  persistAndRender();
}

function resetProductForm() {
  editingProductId = null;
  dom.productForm.reset();
  dom.productQuantityInput.value = 1;
  dom.productFormTitle.textContent = 'Agregar producto';
  dom.productSubmitButton.textContent = 'Agregar producto';
  dom.cancelEditProductButton.classList.add('hidden');
}

function getShareOptions() {
  const format = document.querySelector('input[name="shareFormat"]:checked')?.value || 'text';
  const content = document.querySelector('input[name="shareContent"]:checked')?.value || 'simple';

  return { format, content };
}

function getSummaryText(content = 'simple') {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const lines = [
    `*Cuenta Clara - ${bill.name}*`,
    '',
  ];

  if (content === 'detail') {
    for (const person of bill.people) {
      const detail = calculation.personDetails[person.id];
      lines.push(`*${person.name}: ${formatCurrency(detail.total)}*`);
      lines.push(`Estado: ${person.paid ? 'Pagado' : 'Pendiente'}`);

      if (detail.items.length > 0) {
        lines.push('Detalle:');
        for (const item of detail.items) {
          const shareText = item.totalShares > 1 ? ` (${item.share}/${item.totalShares} partes)` : '';
          lines.push(`- ${item.productName}${shareText}: ${formatCurrency(item.amount)}`);
        }
      } else {
        lines.push('Detalle: sin consumos registrados');
      }

      lines.push(`Subtotal: ${formatCurrency(detail.subtotal)}`);
      lines.push(`Propina: ${formatCurrency(detail.tip)}`);
      lines.push('');
    }
  } else {
    for (const person of bill.people) {
      const detail = calculation.personDetails[person.id];
      lines.push(`*${person.name}: ${formatCurrency(detail.total)}* - ${person.paid ? 'Pagado' : 'Pendiente'}`);
    }

    lines.push('');
  }

  lines.push(`Subtotal: ${formatCurrency(calculation.subtotal)}`);
  lines.push(`Propina (${bill.tipPercent}%): ${formatCurrency(calculation.tipAmount)}`);
  lines.push(`Total cuenta: *${formatCurrency(calculation.grandTotal)}*`);
  lines.push(`Total pagado: *${formatCurrency(calculation.paidTotal)}*`);
  lines.push(`Total pendiente: *${formatCurrency(calculation.pendingTotal)}*`);

  return lines.join('\n');
}

async function copySummary(content = 'simple') {
  const summary = getSummaryText(content);

  try {
    await navigator.clipboard.writeText(summary);
    showToast('Resumen copiado.');
  } catch {
    prompt('Copia el resumen:', summary);
  }
}

function shareWhatsapp(content = 'simple') {
  const summary = getSummaryText(content);
  const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openShareModal() {
  dom.shareModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  updateSharePreview();
}

function closeShareModal() {
  dom.shareModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function updateSharePreview() {
  const { format, content } = getShareOptions();
  const contentLabel = content === 'detail' ? 'Monto con detalle' : 'Solo monto total';
  const formatLabel = format === 'image' ? 'Imagen' : 'Texto';

  dom.sharePreviewType.textContent = `${formatLabel} · ${contentLabel}`;
  dom.textPreview.textContent = getSummaryText(content);

  const isImage = format === 'image';
  dom.imagePreviewWrap.classList.toggle('hidden', !isImage);
  dom.textPreview.classList.toggle('hidden', isImage);

  dom.copySelectedShareButton.disabled = isImage;
  dom.whatsappSelectedShareButton.disabled = false;
  dom.downloadImageButton.disabled = !isImage;
  dom.nativeShareImageButton.disabled = !isImage;

  if (isImage) {
    drawShareImage(content);
  }
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function getCanvasLines(content = 'simple') {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const people = bill.people.map((person) => {
    const detail = calculation.personDetails[person.id];
    return {
      name: person.name,
      paid: person.paid,
      subtotal: detail.subtotal,
      tip: detail.tip,
      total: detail.total,
      items: detail.items,
    };
  });

  return {
    bill,
    calculation,
    people,
    detailed: content === 'detail',
  };
}

function drawShareImage(content = 'simple') {
  const canvas = dom.shareCanvas;
  const ctx = canvas.getContext('2d');
  const data = getCanvasLines(content);
  const width = 900;
  const padding = 58;
  const personBlockBase = data.detailed ? 178 : 74;
  const itemLineHeight = 32;
  const extraItems = data.detailed
    ? data.people.reduce((sum, person) => sum + Math.max(1, person.items.length) * itemLineHeight, 0)
    : 0;
  const height = Math.max(900, 420 + data.people.length * personBlockBase + extraItems);

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#f5f7f8';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f766e';
  roundRect(ctx, 0, 0, width, 210, 0);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 54px Arial';
  ctx.fillText('Cuenta Clara', padding, 92);

  ctx.font = '700 30px Arial';
  ctx.fillText(data.bill.name, padding, 142);

  ctx.font = '500 22px Arial';
  ctx.fillText(data.detailed ? 'Resumen detallado de pagos' : 'Resumen simple de pagos', padding, 176);

  let y = 255;

  for (const person of data.people) {
    const blockHeight = data.detailed
      ? 128 + Math.max(1, person.items.length) * itemLineHeight
      : 74;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, padding, y, width - padding * 2, blockHeight, 24);
    ctx.fill();

    ctx.fillStyle = '#102a27';
    ctx.font = '800 30px Arial';
    ctx.fillText(person.name, padding + 28, y + 48);

    ctx.fillStyle = '#0f766e';
    ctx.font = '800 32px Arial';
    const amount = formatCurrency(person.total);
    const amountWidth = ctx.measureText(amount).width;
    ctx.fillText(amount, width - padding - 28 - amountWidth, y + 48);

    ctx.fillStyle = person.paid ? '#16a34a' : '#f59e0b';
    ctx.font = '700 20px Arial';
    ctx.fillText(person.paid ? 'Pagado' : 'Pendiente', padding + 28, y + 78);

    if (data.detailed) {
      let detailY = y + 112;

      ctx.fillStyle = '#64748b';
      ctx.font = '500 20px Arial';

      if (person.items.length === 0) {
        ctx.fillText('Sin consumos registrados', padding + 28, detailY);
        detailY += itemLineHeight;
      } else {
        for (const item of person.items) {
          const shareText = item.totalShares > 1 ? ` (${item.share}/${item.totalShares})` : '';
          const line = `${item.productName}${shareText}: ${formatCurrency(item.amount)}`;
          detailY = wrapCanvasText(ctx, line, padding + 28, detailY, width - padding * 2 - 56, itemLineHeight);
        }
      }

      ctx.fillStyle = '#102a27';
      ctx.font = '700 20px Arial';
      ctx.fillText(`Subtotal: ${formatCurrency(person.subtotal)} · Propina: ${formatCurrency(person.tip)}`, padding + 28, detailY + 8);
    }

    y += blockHeight + 18;
  }

  y += 12;

  ctx.fillStyle = '#ccfbf1';
  roundRect(ctx, padding, y, width - padding * 2, 184, 26);
  ctx.fill();

  ctx.fillStyle = '#102a27';
  ctx.font = '800 28px Arial';
  ctx.fillText('Totales de la cuenta', padding + 28, y + 48);

  ctx.font = '700 23px Arial';
  ctx.fillText(`Subtotal: ${formatCurrency(data.calculation.subtotal)}`, padding + 28, y + 88);
  ctx.fillText(`Propina (${data.bill.tipPercent}%): ${formatCurrency(data.calculation.tipAmount)}`, padding + 28, y + 122);

  ctx.fillStyle = '#0f766e';
  ctx.font = '800 34px Arial';
  ctx.fillText(`Total: ${formatCurrency(data.calculation.grandTotal)}`, padding + 28, y + 164);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 18px Arial';
  ctx.fillText('Generado con Cuenta Clara', padding, height - 32);
}

function getCanvasBlob() {
  return new Promise((resolve) => {
    dom.shareCanvas.toBlob((blob) => resolve(blob), 'image/png', 1);
  });
}

async function downloadShareImage() {
  const { content } = getShareOptions();
  drawShareImage(content);

  const url = dom.shareCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  const bill = getActiveBill();
  const safeName = bill.name.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '') || 'cuenta-clara';

  link.href = url;
  link.download = `${safeName}-resumen.png`;
  link.click();
  showToast('Imagen descargada.');
}

async function shareImageNatively() {
  const { content } = getShareOptions();
  drawShareImage(content);

  const shared = await tryNativeImageShare();

  if (shared) {
    return;
  }

  await downloadShareImage();
  showNotice('Imagen descargada', 'Tu navegador no permite compartir imagen directo. Se descargó el PNG para que puedas adjuntarlo manualmente.');
}

async function whatsappSelectedShare() {
  const { format, content } = getShareOptions();

  if (format === 'text') {
    shareWhatsapp(content);
    return;
  }

  drawShareImage(content);

  const sharedByNativeMenu = await tryNativeImageShare();

  if (sharedByNativeMenu) {
    return;
  }

  const copied = await copyCanvasImageToClipboard();

  await downloadShareImage();

  const helperText = copied
    ? 'Te copié la imagen al portapapeles y también la descargué. Se abrirá WhatsApp: pega la imagen en el chat con Ctrl+V o adjunta el archivo descargado.'
    : 'Se descargó la imagen. Se abrirá WhatsApp: adjunta manualmente el archivo PNG descargado.';

  showNotice('Imagen lista para WhatsApp', helperText);

  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const message = [
    `*Cuenta Clara - ${bill.name}*`,
    '',
    `Te envío el resumen en imagen.`,
    `Total cuenta: *${formatCurrency(calculation.grandTotal)}*`,
  ].join('\n');

  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

async function tryNativeImageShare() {
  const blob = await getCanvasBlob();

  if (!blob) {
    return false;
  }

  const file = new File([blob], 'cuenta-clara-resumen.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Cuenta Clara',
        text: 'Resumen de la cuenta',
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

async function copyCanvasImageToClipboard() {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  const blob = await getCanvasBlob();

  if (!blob) {
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.dataset.theme = savedTheme;
  dom.themeToggle.textContent = savedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  dom.themeToggle.textContent = next === 'dark' ? 'Modo claro' : 'Modo oscuro';
}

function initServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

dom.closeNoticeTabButton.addEventListener('click', () => dom.noticeTab.classList.add('hidden'));

dom.themeToggle.addEventListener('click', toggleTheme);
dom.newBillButton.addEventListener('click', addBill);
dom.duplicateBillButton.addEventListener('click', duplicateBill);
dom.deleteBillButton.addEventListener('click', deleteActiveBill);

dom.billNameInput.addEventListener('input', () => {
  const bill = getActiveBill();
  bill.name = dom.billNameInput.value.trim() || 'Cuenta sin nombre';
  persistAndRender();
});

dom.personForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addPerson(dom.personNameInput.value);
});

dom.tipPercentInput.addEventListener('input', () => {
  const bill = getActiveBill();
  const value = Number(dom.tipPercentInput.value);

  bill.tipPercent = Number.isFinite(value) && value >= 0 ? value : 0;
  persistAndRender();
});

dom.quickTipButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const bill = getActiveBill();
    bill.tipPercent = Number(button.dataset.tip);
    persistAndRender();
  });
});

dom.selectAllConsumersButton.addEventListener('click', () => {
  const checkboxes = [...dom.consumerList.querySelectorAll('input[type="checkbox"]')];
  const shouldSelect = checkboxes.some((checkbox) => !checkbox.checked);

  for (const checkbox of checkboxes) {
    checkbox.checked = shouldSelect;
    const shareInput = checkbox.closest('.consumer-row').querySelector('input[type="number"]');
    shareInput.disabled = !shouldSelect;
  }
});

dom.productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitProduct();
});

dom.cancelEditProductButton.addEventListener('click', () => {
  resetProductForm();
  renderProductForm();
});

dom.copySummaryButton.addEventListener('click', () => copySummary('simple'));
dom.whatsappButton.addEventListener('click', () => shareWhatsapp('simple'));

dom.shareButton.addEventListener('click', openShareModal);
dom.closeShareModalButton.addEventListener('click', closeShareModal);
dom.shareModal.addEventListener('click', (event) => {
  if (event.target === dom.shareModal) {
    closeShareModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dom.shareModal.classList.contains('hidden')) {
    closeShareModal();
  }
});

document.querySelectorAll('input[name="shareFormat"], input[name="shareContent"]').forEach((input) => {
  input.addEventListener('change', updateSharePreview);
});

dom.copySelectedShareButton.addEventListener('click', () => {
  const { content } = getShareOptions();
  copySummary(content);
});

dom.whatsappSelectedShareButton.addEventListener('click', whatsappSelectedShare);
dom.downloadImageButton.addEventListener('click', downloadShareImage);
dom.nativeShareImageButton.addEventListener('click', shareImageNatively);

initTheme();
loadState();
saveState();
render();
initServiceWorker();
