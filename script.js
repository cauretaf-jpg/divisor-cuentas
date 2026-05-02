const GUEST_STORAGE_KEY = 'cuenta-clara-v1-state';
const LOCAL_USERS_KEY = 'cuenta-clara-local-users-v1';
const AUTH_SESSION_KEY = 'cuenta-clara-auth-session';
let activeStorageKey = GUEST_STORAGE_KEY;
let currentSession = { mode: 'guest', email: '', name: '' };
const THEME_KEY = 'cuenta-clara-theme';

const CATEGORIES = [
  'Comida',
  'Bebestibles',
  'Tragos',
  'Postres',
  'Transporte',
  'Arriendo',
  'Luz',
  'Agua',
  'Gas',
  'Internet',
  'Gastos comunes',
  'Supermercado',
  'Streaming',
  'Otros',
];

const DEFAULT_QUICK_PRODUCTS = [
  { name: 'Papas fritas', category: 'Comida' },
  { name: 'Bebida', category: 'Bebestibles' },
  { name: 'Cerveza', category: 'Tragos' },
  { name: 'Pizza', category: 'Comida' },
  { name: 'Mojito', category: 'Tragos' },
  { name: 'Postre', category: 'Postres' },
  { name: 'Luz', category: 'Luz' },
  { name: 'Agua', category: 'Agua' },
  { name: 'Internet', category: 'Internet' },
  { name: 'Supermercado', category: 'Supermercado' },
];

const dom = {
  themeToggle: document.querySelector('#themeToggle'),
  installAppButton: document.querySelector('#installAppButton'),
  authButton: document.querySelector('#authButton'),
  authStatusBadge: document.querySelector('#authStatusBadge'),
  newBillButton: document.querySelector('#newBillButton'),
  duplicateBillButton: document.querySelector('#duplicateBillButton'),
  archiveBillButton: document.querySelector('#archiveBillButton'),
  deleteBillButton: document.querySelector('#deleteBillButton'),
  billList: document.querySelector('#billList'),
  billNameInput: document.querySelector('#billNameInput'),
  billMeta: document.querySelector('#billMeta'),

  historySearchInput: document.querySelector('#historySearchInput'),
  historyFilterSelect: document.querySelector('#historyFilterSelect'),
  exportBackupButton: document.querySelector('#exportBackupButton'),
  importBackupButton: document.querySelector('#importBackupButton'),
  backupFileInput: document.querySelector('#backupFileInput'),

  personForm: document.querySelector('#personForm'),
  personNameInput: document.querySelector('#personNameInput'),
  personPhoneInput: document.querySelector('#personPhoneInput'),
  peopleList: document.querySelector('#peopleList'),
  markAllPaidButton: document.querySelector('#markAllPaidButton'),
  markAllPendingButton: document.querySelector('#markAllPendingButton'),

  tipCard: document.querySelector('#tipCard'),
  tipPercentInput: document.querySelector('#tipPercentInput'),
  quickTipButtons: document.querySelectorAll('[data-tip]'),
  clearProductsButton: document.querySelector('#clearProductsButton'),
  resetBillButton: document.querySelector('#resetBillButton'),

  payerSelect: document.querySelector('#payerSelect'),
  quickTotalPanel: document.querySelector('#quickTotalPanel'),
  quickTotalInput: document.querySelector('#quickTotalInput'),
  homePanel: document.querySelector('#homePanel'),
  homeMonthInput: document.querySelector('#homeMonthInput'),
  duplicateHomeMonthButton: document.querySelector('#duplicateHomeMonthButton'),

  productEditorCard: document.querySelector('#productEditorCard'),
  productListCard: document.querySelector('#productListCard'),
  productForm: document.querySelector('#productForm'),
  productFormTitle: document.querySelector('#productFormTitle'),
  productNameLabel: document.querySelector('#productNameLabel'),
  productNameInput: document.querySelector('#productNameInput'),
  productPriceInput: document.querySelector('#productPriceInput'),
  productQuantityInput: document.querySelector('#productQuantityInput'),
  productCategoryInput: document.querySelector('#productCategoryInput'),
  productSplitModeInput: document.querySelector('#productSplitModeInput'),
  productDueDateInput: document.querySelector('#productDueDateInput'),
  productRecurringInput: document.querySelector('#productRecurringInput'),
  consumerPanelTitle: document.querySelector('#consumerPanelTitle'),
  consumerPanelHelp: document.querySelector('#consumerPanelHelp'),
  consumerList: document.querySelector('#consumerList'),
  selectAllConsumersButton: document.querySelector('#selectAllConsumersButton'),
  cancelEditProductButton: document.querySelector('#cancelEditProductButton'),
  productSubmitButton: document.querySelector('#productSubmitButton'),
  toggleQuickProductsEditorButton: document.querySelector('#toggleQuickProductsEditorButton'),
  quickProductsList: document.querySelector('#quickProductsList'),
  quickProductsEditor: document.querySelector('#quickProductsEditor'),
  quickProductForm: document.querySelector('#quickProductForm'),
  quickProductNameInput: document.querySelector('#quickProductNameInput'),
  quickProductCategoryInput: document.querySelector('#quickProductCategoryInput'),
  quickProductsManager: document.querySelector('#quickProductsManager'),
  productSearchInput: document.querySelector('#productSearchInput'),
  productFilterSelect: document.querySelector('#productFilterSelect'),
  categoryTotals: document.querySelector('#categoryTotals'),
  productListTitle: document.querySelector('#productListTitle'),
  homeDashboardCard: document.querySelector('#homeDashboardCard'),
  homeRecurringOutput: document.querySelector('#homeRecurringOutput'),
  homeUpcomingOutput: document.querySelector('#homeUpcomingOutput'),
  homeOverdueOutput: document.querySelector('#homeOverdueOutput'),
  homeDueList: document.querySelector('#homeDueList'),
  productList: document.querySelector('#productList'),

  accountStatus: document.querySelector('#accountStatus'),
  subtotalOutput: document.querySelector('#subtotalOutput'),
  tipOutput: document.querySelector('#tipOutput'),
  grandTotalOutput: document.querySelector('#grandTotalOutput'),
  paidTotalOutput: document.querySelector('#paidTotalOutput'),
  pendingTotalOutput: document.querySelector('#pendingTotalOutput'),
  personResults: document.querySelector('#personResults'),
  transferList: document.querySelector('#transferList'),
  transferCard: document.querySelector('#transferCard'),

  copySummaryButton: document.querySelector('#copySummaryButton'),
  whatsappButton: document.querySelector('#whatsappButton'),
  shareButton: document.querySelector('#shareButton'),
  shareLinkButton: document.querySelector('#shareLinkButton'),
  exportExcelButton: document.querySelector('#exportExcelButton'),

  mobileTotalOutput: document.querySelector('#mobileTotalOutput'),
  mobileAddProductButton: document.querySelector('#mobileAddProductButton'),
  mobileShareButton: document.querySelector('#mobileShareButton'),

  authModal: document.querySelector('#authModal'),
  closeAuthModalButton: document.querySelector('#closeAuthModalButton'),
  authSessionPanel: document.querySelector('#authSessionPanel'),
  authFormsPanel: document.querySelector('#authFormsPanel'),
  authSessionTitle: document.querySelector('#authSessionTitle'),
  authSessionDescription: document.querySelector('#authSessionDescription'),
  showLoginButton: document.querySelector('#showLoginButton'),
  showRegisterButton: document.querySelector('#showRegisterButton'),
  loginForm: document.querySelector('#loginForm'),
  registerForm: document.querySelector('#registerForm'),
  loginEmailInput: document.querySelector('#loginEmailInput'),
  loginPasswordInput: document.querySelector('#loginPasswordInput'),
  registerNameInput: document.querySelector('#registerNameInput'),
  registerEmailInput: document.querySelector('#registerEmailInput'),
  registerPasswordInput: document.querySelector('#registerPasswordInput'),
  importGuestDataCheckbox: document.querySelector('#importGuestDataCheckbox'),
  continueGuestButton: document.querySelector('#continueGuestButton'),
  switchToGuestButton: document.querySelector('#switchToGuestButton'),
  logoutButton: document.querySelector('#logoutButton'),

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
  quickProducts: [],
};

let editingProductId = null;
let toastTimer = null;
let noticeTimer = null;
let deferredInstallPrompt = null;

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



function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getUserStorageKey(email) {
  return `cuenta-clara-user-state:${normalizeEmail(email)}`;
}

function createSalt() {
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(12);
    window.crypto.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function digestText(text) {
  if (window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hashBuffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  let hash = 0;

  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }

  return `fallback_${Math.abs(hash)}`;
}

async function hashPassword(password, salt) {
  return digestText(`${salt}:${password}`);
}

function loadAuthSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));

    if (saved && saved.mode === 'user' && saved.email) {
      const email = normalizeEmail(saved.email);
      const user = getUsers().find((item) => normalizeEmail(item.email) === email);

      if (user) {
        currentSession = {
          mode: 'user',
          email,
          name: user.name || email,
        };
        activeStorageKey = getUserStorageKey(email);
        return;
      }
    }
  } catch {
    // Si la sesión guardada está corrupta, volvemos a invitado.
  }

  currentSession = { mode: 'guest', email: '', name: '' };
  activeStorageKey = GUEST_STORAGE_KEY;
}

function saveAuthSession() {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  currentSession = { mode: 'guest', email: '', name: '' };
  activeStorageKey = GUEST_STORAGE_KEY;
}

function renderAuthUI() {
  if (!dom.authButton || !dom.authStatusBadge) {
    return;
  }

  const isUser = currentSession.mode === 'user';

  dom.authStatusBadge.textContent = isUser ? `Usuario: ${currentSession.name || currentSession.email}` : 'Invitado';
  dom.authStatusBadge.classList.toggle('is-user', isUser);
  dom.authButton.textContent = isUser ? 'Mi cuenta' : 'Ingresar';

  if (dom.authSessionPanel && dom.authFormsPanel) {
    dom.authSessionPanel.classList.toggle('hidden', !isUser);
    dom.authFormsPanel.classList.toggle('hidden', isUser);

    if (isUser) {
      dom.authSessionTitle.textContent = `Hola, ${currentSession.name || currentSession.email}`;
      dom.authSessionDescription.textContent = `Tus cuentas se están guardando en este navegador para ${currentSession.email}.`;
    }
  }
}

function openAuthModal() {
  renderAuthUI();
  dom.authModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeAuthModal() {
  dom.authModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function showLoginForm() {
  dom.loginForm.classList.remove('hidden');
  dom.registerForm.classList.add('hidden');
  dom.showLoginButton.classList.add('active');
  dom.showRegisterButton.classList.remove('active');
}

function showRegisterForm() {
  dom.registerForm.classList.remove('hidden');
  dom.loginForm.classList.add('hidden');
  dom.showRegisterButton.classList.add('active');
  dom.showLoginButton.classList.remove('active');
}

async function registerLocalUser(event) {
  event.preventDefault();

  const name = dom.registerNameInput.value.trim();
  const email = normalizeEmail(dom.registerEmailInput.value);
  const password = dom.registerPasswordInput.value;

  if (!name) {
    showToast('Ingresa tu nombre.');
    return;
  }

  if (!email) {
    showToast('Ingresa tu correo.');
    return;
  }

  if (!password || password.length < 4) {
    showToast('La contraseña debe tener al menos 4 caracteres.');
    return;
  }

  const users = getUsers();

  if (users.some((user) => normalizeEmail(user.email) === email)) {
    showNotice('Usuario existente', 'Ya existe una cuenta local con ese correo. Inicia sesión.');
    return;
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(password, salt);
  const createdAt = nowIso();

  users.push({
    id: createId('user'),
    name,
    email,
    salt,
    passwordHash,
    createdAt,
  });

  saveUsers(users);

  const userStorageKey = getUserStorageKey(email);

  if (dom.importGuestDataCheckbox.checked) {
    localStorage.setItem(userStorageKey, JSON.stringify(state));
  } else {
    localStorage.setItem(userStorageKey, JSON.stringify(normalizeState(null)));
  }

  currentSession = { mode: 'user', email, name };
  activeStorageKey = userStorageKey;
  saveAuthSession();
  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Cuenta creada e iniciada.');
}

async function loginLocalUser(event) {
  event.preventDefault();

  const email = normalizeEmail(dom.loginEmailInput.value);
  const password = dom.loginPasswordInput.value;
  const user = getUsers().find((item) => normalizeEmail(item.email) === email);

  if (!user) {
    showNotice('Usuario no encontrado', 'No existe una cuenta local con ese correo en este navegador.');
    return;
  }

  const passwordHash = await hashPassword(password, user.salt);

  if (passwordHash !== user.passwordHash) {
    showNotice('Contraseña incorrecta', 'Revisa la contraseña e inténtalo nuevamente.');
    return;
  }

  saveState();

  currentSession = {
    mode: 'user',
    email: normalizeEmail(user.email),
    name: user.name || user.email,
  };
  activeStorageKey = getUserStorageKey(user.email);
  saveAuthSession();

  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Sesión iniciada.');
}

function switchToGuestMode() {
  saveState();
  clearAuthSession();
  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Modo invitado activo.');
}

function logoutLocalUser() {
  saveState();
  clearAuthSession();
  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Sesión cerrada.');
}


function normalizePhoneNumber(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return '';
  }

  let digits = raw.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.length === 9 && digits.startsWith('9')) {
    digits = `56${digits}`;
  }

  if (digits.length === 10 && digits.startsWith('09')) {
    digits = `56${digits.slice(1)}`;
  }

  return digits;
}

function formatPhoneForDisplay(value) {
  const digits = normalizePhoneNumber(value);

  if (!digits) {
    return '';
  }

  if (digits.startsWith('56') && digits.length === 11) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }

  return `+${digits}`;
}

function buildPersonalWhatsappMessage(person, amount) {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((item) => item.id === bill.payerId);
  const lines = [
    `Hola ${person.name}, te comparto el resumen de *${bill.name}*.`,
    '',
    `Monto a pagar: *${formatCurrency(amount || 0)}*`,
  ];

  if (payer && payer.id !== person.id && amount > 0) {
    lines.push(`Transferir a: *${payer.name}*`);
  }

  if (bill.mode === 'home' && bill.homeMonth) {
    lines.push(`Mes: *${bill.homeMonth}*`);
  }

  lines.push('');
  lines.push(`Total cuenta: *${formatCurrency(calculation.grandTotal)}*`);

  return lines.join('\n');
}

function openPersonWhatsapp(personId, amount = 0) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    showToast('No se encontró la persona.');
    return;
  }

  const phone = normalizePhoneNumber(person.phone);

  if (!phone) {
    showNotice('Teléfono faltante', `Agrega un teléfono a ${person.name} para enviarle WhatsApp.`);
    return;
  }

  const message = buildPersonalWhatsappMessage(person, amount);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function getCurrentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

function makeDefaultBill() {
  const createdAt = nowIso();

  return {
    id: createId('bill'),
    name: 'Nueva cuenta',
    mode: 'detailed',
    quickTotal: 0,
    homeMonth: getCurrentMonthValue(),
    payerId: '',
    tipPercent: 10,
    archived: false,
    createdAt,
    updatedAt: createdAt,
    people: [],
    products: [],
  };
}

function makeDefaultQuickProducts() {
  return DEFAULT_QUICK_PRODUCTS.map((product) => ({
    id: createId('quick'),
    name: product.name,
    category: product.category,
  }));
}

function normalizeQuickProducts(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return makeDefaultQuickProducts();
  }

  return products
    .map((product) => ({
      id: product.id || createId('quick'),
      name: String(product.name || '').trim(),
      category: CATEGORIES.includes(product.category) ? product.category : 'Otros',
    }))
    .filter((product) => product.name);
}

function normalizeState(input) {
  if (!input || !Array.isArray(input.bills)) {
    const bill = makeDefaultBill();
    return { bills: [bill], activeBillId: bill.id, quickProducts: makeDefaultQuickProducts() };
  }

  const bills = input.bills.map((bill) => {
    const people = Array.isArray(bill.people)
      ? bill.people.map((person) => ({
          id: person.id || createId('person'),
          name: String(person.name || 'Persona'),
          phone: normalizePhoneNumber(person.phone || ''),
          paid: Boolean(person.paid),
        }))
      : [];

    const normalized = {
      id: bill.id || createId('bill'),
      name: String(bill.name || 'Cuenta sin nombre'),
      mode: ['quick', 'home'].includes(bill.mode) ? bill.mode : 'detailed',
      quickTotal: Number(bill.quickTotal || 0),
      homeMonth: bill.homeMonth || getCurrentMonthValue(),
      payerId: bill.payerId && people.some((p) => p.id === bill.payerId) ? bill.payerId : '',
      tipPercent: Number.isFinite(Number(bill.tipPercent)) ? Number(bill.tipPercent) : 10,
      archived: Boolean(bill.archived),
      createdAt: bill.createdAt || nowIso(),
      updatedAt: bill.updatedAt || bill.createdAt || nowIso(),
      people,
      products: Array.isArray(bill.products)
        ? bill.products.map((product) => ({
            id: product.id || createId('product'),
            name: String(product.name || 'Producto'),
            unitPrice: Number(product.unitPrice ?? product.price ?? 0),
            quantity: Number(product.quantity ?? 1),
            category: CATEGORIES.includes(product.category) ? product.category : 'Otros',
            splitMode: product.splitMode === 'responsibles' ? 'responsibles' : 'participants',
            dueDate: product.dueDate || '',
            recurring: Boolean(product.recurring),
            consumers: Array.isArray(product.consumers)
              ? product.consumers.map((consumer) => ({
                  personId: consumer.personId,
                  share: Math.max(1, Number(consumer.share || 1)),
                }))
              : [],
          }))
        : [],
    };

    return normalized;
  });

  if (bills.length === 0) {
    const bill = makeDefaultBill();
    return { bills: [bill], activeBillId: bill.id, quickProducts: normalizeQuickProducts(input?.quickProducts) };
  }

  const activeBillId = bills.some((bill) => bill.id === input.activeBillId)
    ? input.activeBillId
    : bills[0].id;

  return { bills, activeBillId, quickProducts: normalizeQuickProducts(input.quickProducts) };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(activeStorageKey));
    state = normalizeState(saved);
  } catch {
    state = normalizeState(null);
  }
}


function migrateEmptyDefaultPeople() {
  let changed = false;

  for (const bill of state.bills) {
    const names = (bill.people || []).map((person) => person.name).sort().join('|');
    const isOldEmptyStarter =
      bill.name === 'Nueva cuenta' &&
      names === 'Carlos|Vale' &&
      (!Array.isArray(bill.products) || bill.products.length === 0) &&
      (!bill.quickTotal || Number(bill.quickTotal) === 0);

    if (isOldEmptyStarter) {
      bill.people = [];
      bill.payerId = '';
      changed = true;
    }
  }

  if (changed) {
    saveState();
  }
}


function saveState() {
  localStorage.setItem(activeStorageKey, JSON.stringify(state));
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
  }, 5600);
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
  const categoryTotals = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));

  if (bill.mode === 'quick') {
    const totalPeople = bill.people.length;
    const quickTotal = Number(bill.quickTotal) || 0;

    if (totalPeople > 0 && quickTotal > 0) {
      const perPerson = quickTotal / totalPeople;

      for (const person of bill.people) {
        baseTotals[person.id] = perPerson;
        personDetails[person.id].items.push({
          productId: 'quick_total',
          productName: 'Cuenta rápida',
          unitPrice: quickTotal,
          quantity: 1,
          productTotal: quickTotal,
          share: 1,
          totalShares: totalPeople,
          amount: perPerson,
          category: 'Otros',
        });
      }

      categoryTotals.Otros = quickTotal;
    }
  } else {
    for (const product of bill.products) {
      const validConsumers = product.consumers.filter((consumer) =>
        bill.people.some((person) => person.id === consumer.personId)
      );

      const totalShares = validConsumers.reduce((sum, consumer) => sum + Math.max(1, Number(consumer.share || 1)), 0);

      if (totalShares <= 0) {
        continue;
      }

      const productTotal = Number(product.unitPrice) * Number(product.quantity);
      const category = CATEGORIES.includes(product.category) ? product.category : 'Otros';
      categoryTotals[category] += productTotal;

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
            category,
            splitMode: product.splitMode || 'participants',
          });
        }
      }
    }
  }

  const subtotal = Object.values(baseTotals).reduce((sum, value) => sum + value, 0);
  const tipPercent = bill.mode === 'home' ? 0 : (Number(bill.tipPercent) || 0);
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

  const paidPeople = bill.people.filter((person) => person.paid).length;
  const isPaid = bill.people.length > 0 && paidPeople === bill.people.length;

  return {
    subtotal,
    tipAmount,
    grandTotal: subtotal + tipAmount,
    paidTotal,
    pendingTotal,
    baseTotals,
    finalTotals,
    personDetails,
    categoryTotals,
    paidPeople,
    totalPeople: bill.people.length,
    isPaid,
  };
}

function getBillStatus(bill) {
  const calc = calculateBill(bill);

  if (bill.archived) return 'archived';
  if (calc.isPaid) return 'paid';
  return 'pending';
}


function renderQuickProducts() {
  dom.quickProductsList.innerHTML = '';
  dom.quickProductsManager.innerHTML = '';

  if (!state.quickProducts || state.quickProducts.length === 0) {
    dom.quickProductsList.appendChild(emptyMessage('No hay productos rápidos. Agrega algunos desde Editar rápidos.'));
    return;
  }

  for (const product of state.quickProducts) {
    const button = document.createElement('button');
    button.className = 'chip';
    button.type = 'button';
    button.textContent = `+ ${product.name}`;
    button.title = `${product.name} · ${product.category}`;

    button.addEventListener('click', () => {
      dom.productNameInput.value = product.name;
      dom.productCategoryInput.value = product.category || 'Otros';
      dom.productPriceInput.focus();
    });

    dom.quickProductsList.appendChild(button);

    const row = document.createElement('div');
    row.className = 'quick-product-manager-row';
    row.innerHTML = `
      <div>
        <strong title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.category)}</span>
      </div>
      <button class="icon-button edit" type="button" aria-label="Editar ${escapeHtml(product.name)}">✎</button>
      <button class="icon-button danger" type="button" aria-label="Eliminar ${escapeHtml(product.name)}">×</button>
    `;

    row.querySelector('.icon-button.edit').addEventListener('click', () => {
      editQuickProduct(product.id);
    });

    row.querySelector('.icon-button.danger').addEventListener('click', () => {
      deleteQuickProduct(product.id);
    });

    dom.quickProductsManager.appendChild(row);
  }
}

function addQuickProduct(name, category) {
  const cleanName = name.trim();

  if (!cleanName) {
    showToast('Ingresa el nombre del producto rápido.');
    return;
  }

  const exists = state.quickProducts.some((product) => product.name.toLowerCase() === cleanName.toLowerCase());

  if (exists) {
    showNotice('Producto repetido', 'Ya existe un producto rápido con ese nombre.');
    return;
  }

  state.quickProducts.push({
    id: createId('quick'),
    name: cleanName,
    category: CATEGORIES.includes(category) ? category : 'Otros',
  });

  dom.quickProductNameInput.value = '';
  saveState();
  renderQuickProducts();
  showToast('Producto rápido agregado.');
}

function editQuickProduct(productId) {
  const product = state.quickProducts.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const newName = prompt('Nuevo nombre del producto rápido:', product.name);

  if (newName === null) {
    return;
  }

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast('El nombre no puede quedar vacío.');
    return;
  }

  const exists = state.quickProducts.some(
    (item) => item.id !== productId && item.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (exists) {
    showNotice('Producto repetido', 'Ya existe un producto rápido con ese nombre.');
    return;
  }

  const newCategory = prompt(`Categoría (${CATEGORIES.join(', ')}):`, product.category);

  if (newCategory === null) {
    return;
  }

  product.name = cleanName;
  product.category = CATEGORIES.includes(newCategory.trim()) ? newCategory.trim() : 'Otros';

  saveState();
  renderQuickProducts();
  showToast('Producto rápido actualizado.');
}

function deleteQuickProduct(productId) {
  const product = state.quickProducts.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const confirmed = confirm(`¿Eliminar el producto rápido "${product.name}"?`);

  if (!confirmed) {
    return;
  }

  state.quickProducts = state.quickProducts.filter((item) => item.id !== productId);
  saveState();
  renderQuickProducts();
  showToast('Producto rápido eliminado.');
}


function renderBillList() {
  const search = dom.historySearchInput.value.trim().toLowerCase();
  const filter = dom.historyFilterSelect.value;
  dom.billList.innerHTML = '';

  const filteredBills = state.bills.filter((bill) => {
    const status = getBillStatus(bill);
    const matchesSearch = bill.name.toLowerCase().includes(search);

    if (!matchesSearch) return false;
    if (filter === 'all') return !bill.archived;
    return status === filter;
  });

  if (filteredBills.length === 0) {
    dom.billList.appendChild(cloneEmptyState());
    return;
  }

  for (const bill of filteredBills) {
    const calculation = calculateBill(bill);
    const status = getBillStatus(bill);
    const statusLabel = status === 'paid' ? 'Pagada' : status === 'archived' ? 'Archivada' : 'Pendiente';
    const button = document.createElement('button');
    button.className = `bill-item ${bill.id === state.activeBillId ? 'active' : ''} ${bill.archived ? 'archived' : ''}`;
    button.type = 'button';
    button.innerHTML = `
      <div>
        <strong>${escapeHtml(bill.name)}</strong>
        <span>${formatCurrency(calculation.grandTotal)} · ${bill.people.length} personas · ${statusLabel}</span>
        <span>${formatDate(bill.updatedAt)}</span>
      </div>
      <span class="bill-count">${bill.mode === 'quick' ? 'R' : bill.products.length}</span>
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
  const isQuick = bill.mode === 'quick';
  const isHome = bill.mode === 'home';

  dom.billNameInput.value = bill.name;
  dom.billMeta.textContent = `Creada: ${formatDate(bill.createdAt)} · Última edición: ${formatDate(bill.updatedAt)}`;
  dom.deleteBillButton.disabled = state.bills.length <= 1;
  dom.archiveBillButton.textContent = bill.archived ? 'Desarchivar' : 'Archivar';

  document.querySelectorAll('input[name="billMode"]').forEach((input) => {
    input.checked = input.value === bill.mode;
  });

  dom.quickTotalPanel.classList.toggle('hidden', !isQuick);
  dom.tipCard.classList.toggle('hidden', isHome);
  dom.homePanel.classList.toggle('hidden', !isHome);
  dom.productEditorCard.classList.toggle('hidden', isQuick);
  dom.productListCard.classList.toggle('hidden', isQuick);
  dom.homeDashboardCard.classList.toggle('hidden', !isHome);
  dom.quickTotalInput.value = bill.quickTotal || '';
  dom.homeMonthInput.value = bill.homeMonth || getCurrentMonthValue();
  dom.tipPercentInput.value = bill.tipPercent;

  dom.productNameLabel.textContent = isHome ? 'Gasto' : 'Producto';
  dom.productNameInput.placeholder = isHome ? 'Ej: Luz, Arriendo, Supermercado' : 'Ej: Papas fritas';
  dom.productListTitle.textContent = isHome ? 'Gastos agregados' : 'Productos agregados';
  updateDivisionCopy();
  document.querySelectorAll('.home-only').forEach((element) => element.classList.toggle('hidden', !isHome));
}


function renderPayerSelect() {
  const bill = getActiveBill();
  const current = bill.payerId;
  dom.payerSelect.innerHTML = '<option value="">Sin pagador principal</option>';

  for (const person of bill.people) {
    const option = document.createElement('option');
    option.value = person.id;
    option.textContent = person.name;
    dom.payerSelect.appendChild(option);
  }

  dom.payerSelect.value = bill.people.some((person) => person.id === current) ? current : '';
}

function renderPeople() {
  const bill = getActiveBill();
  dom.peopleList.innerHTML = '';

  if (bill.people.length === 0) {
    dom.peopleList.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const hasPhone = Boolean(normalizePhoneNumber(person.phone));
    const row = document.createElement('div');
    row.className = 'person-row';
    row.innerHTML = `
      <div class="person-info">
        <strong title="${escapeHtml(person.name)}">${escapeHtml(person.name)}</strong>
        <small>${hasPhone ? escapeHtml(formatPhoneForDisplay(person.phone)) : 'Sin teléfono'}</small>
      </div>
      <button class="icon-button whatsapp ${hasPhone ? '' : 'muted'}" type="button" aria-label="Enviar WhatsApp a ${escapeHtml(person.name)}">☏</button>
      <button class="icon-button edit" type="button" aria-label="Editar ${escapeHtml(person.name)}">✎</button>
      <button class="icon-button danger" type="button" aria-label="Eliminar ${escapeHtml(person.name)}">×</button>
      <button class="paid-toggle ${person.paid ? 'is-paid' : ''}" type="button">
        ${person.paid ? 'Pagado' : 'Pendiente'}
      </button>
    `;

    row.querySelector('.paid-toggle').addEventListener('click', () => {
      person.paid = !person.paid;
      persistAndRender();
    });

    row.querySelector('.icon-button.whatsapp').addEventListener('click', () => {
      const calculation = calculateBill(bill);
      openPersonWhatsapp(person.id, calculation.finalTotals[person.id] || 0);
    });

    row.querySelector('.icon-button.danger').addEventListener('click', () => {
      deletePerson(person.id);
    });

    row.querySelector('.icon-button.edit').addEventListener('click', () => {
      editPerson(person.id);
    });

    row.querySelector('strong').addEventListener('dblclick', () => {
      editPerson(person.id);
    });

    dom.peopleList.appendChild(row);
  }
}

function updateDivisionCopy() {
  const bill = getActiveBill();
  const splitMode = dom.productSplitModeInput?.value === 'responsibles' ? 'responsibles' : 'participants';

  if (splitMode === 'responsibles') {
    dom.consumerPanelTitle.textContent = 'Responsables de pago';
    dom.consumerPanelHelp.textContent = 'Marca quién paga este gasto y cuántas partes asume cada responsable. Ej: Wladimir 2, Carlos 2, Pamela 1.';
    return;
  }

  dom.consumerPanelTitle.textContent = bill.mode === 'home' ? '¿Entre quiénes se divide?' : '¿Quiénes consumieron?';
  dom.consumerPanelHelp.textContent = bill.mode === 'home'
    ? 'Marca las personas que participan en este gasto y ajusta las partes si corresponde.'
    : 'Marca las personas y ajusta las partes si alguien consumió más.';
}

function renderConsumers() {
  const bill = getActiveBill();
  const currentProduct = editingProductId
    ? bill.products.find((product) => product.id === editingProductId)
    : null;
  const splitMode = dom.productSplitModeInput?.value === 'responsibles' ? 'responsibles' : 'participants';
  const defaultChecked = splitMode === 'responsibles' ? false : true;

  dom.consumerList.innerHTML = '';

  if (bill.people.length === 0) {
    dom.consumerList.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const existing = currentProduct?.consumers.find((consumer) => consumer.personId === person.id);
    const checked = currentProduct ? Boolean(existing) : defaultChecked;
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

function renderCategoryTotals() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);

  dom.categoryTotals.innerHTML = '';

  for (const [category, total] of Object.entries(calculation.categoryTotals)) {
    if (total <= 0) continue;

    const pill = document.createElement('span');
    pill.className = 'category-pill';
    pill.textContent = `${category}: ${formatCurrency(total)}`;
    dom.categoryTotals.appendChild(pill);
  }
}

function renderProducts() {
  const bill = getActiveBill();
  dom.productList.innerHTML = '';

  const search = dom.productSearchInput.value.trim().toLowerCase();
  const filter = dom.productFilterSelect.value;

  const products = bill.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'shared' && product.consumers.length > 1) ||
      product.category === filter;

    return matchesSearch && matchesFilter;
  });

  if (bill.products.length === 0 || products.length === 0) {
    dom.productList.appendChild(cloneEmptyState());
    return;
  }

  for (const product of products) {
    const productTotal = Number(product.unitPrice) * Number(product.quantity);
    const divisionLabel = product.splitMode === 'responsibles'
      ? 'Responsables'
      : (bill.mode === 'home' ? 'Participantes' : 'Consumidores');
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
          ${escapeHtml(product.category)} · ${formatCurrency(product.unitPrice)} × ${product.quantity} = ${formatCurrency(productTotal)}
          ${bill.mode === 'home' && product.dueDate ? `<br />Vence: ${escapeHtml(formatShortDate(product.dueDate))}` : ''}
          ${bill.mode === 'home' && product.recurring ? '<br />Recurrente' : ''}
          <br />
          ${divisionLabel}: ${escapeHtml(consumerNames || 'Sin personas seleccionadas')}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-light btn-small" data-action="edit" type="button">Editar</button>
        <button class="btn btn-light btn-small" data-action="duplicate" type="button">Duplicar</button>
        <button class="btn btn-danger-light btn-small" data-action="delete" type="button">Eliminar</button>
      </div>
    `;

    row.querySelector('[data-action="edit"]').addEventListener('click', () => {
      startEditProduct(product.id);
    });

    row.querySelector('[data-action="duplicate"]').addEventListener('click', () => {
      duplicateProduct(product.id);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteProduct(product.id);
    });

    dom.productList.appendChild(row);
  }
}

function renderProductForm() {
  const bill = getActiveBill();
  const isHome = bill.mode === 'home';

  if (!editingProductId) {
    dom.productFormTitle.textContent = isHome ? 'Agregar gasto del hogar' : 'Agregar producto';
    dom.productSubmitButton.textContent = isHome ? 'Agregar gasto' : 'Agregar producto';
    dom.cancelEditProductButton.classList.add('hidden');
    dom.productSplitModeInput.value = isHome ? 'responsibles' : 'participants';
    dom.productDueDateInput.value = '';
    dom.productRecurringInput.checked = false;
    renderConsumers();
    return;
  }

  const product = bill.products.find((item) => item.id === editingProductId);

  if (!product) {
    editingProductId = null;
    renderProductForm();
    return;
  }

  dom.productFormTitle.textContent = isHome ? 'Editar gasto' : 'Editar producto';
  dom.productSubmitButton.textContent = 'Guardar cambios';
  dom.cancelEditProductButton.classList.remove('hidden');

  dom.productNameInput.value = product.name;
  dom.productPriceInput.value = product.unitPrice;
  dom.productQuantityInput.value = product.quantity;
  dom.productCategoryInput.value = product.category || 'Otros';
  dom.productSplitModeInput.value = product.splitMode === 'responsibles' ? 'responsibles' : 'participants';
  dom.productDueDateInput.value = product.dueDate || '';
  dom.productRecurringInput.checked = Boolean(product.recurring);

  renderConsumers();
}


function formatShortDate(value) {
  if (!value) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function daysUntil(dateValue) {
  if (!dateValue) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${dateValue}T00:00:00`);
  return Math.round((target - todayStart) / 86400000);
}

function renderHomeDashboard() {
  const bill = getActiveBill();

  if (bill.mode !== 'home') return;

  const recurrent = bill.products.filter((product) => product.recurring).length;
  const withDueDate = bill.products
    .filter((product) => product.dueDate)
    .map((product) => ({ ...product, days: daysUntil(product.dueDate) }))
    .sort((a, b) => (a.days ?? 99999) - (b.days ?? 99999));

  const upcoming = withDueDate.filter((product) => product.days !== null && product.days >= 0 && product.days <= 7).length;
  const overdue = withDueDate.filter((product) => product.days !== null && product.days < 0).length;

  dom.homeRecurringOutput.textContent = recurrent;
  dom.homeUpcomingOutput.textContent = upcoming;
  dom.homeOverdueOutput.textContent = overdue;
  dom.homeDueList.innerHTML = '';

  if (!withDueDate.length) {
    dom.homeDueList.appendChild(emptyMessage('No hay vencimientos registrados todavía.'));
    return;
  }

  for (const product of withDueDate.slice(0, 8)) {
    const productTotal = Number(product.unitPrice) * Number(product.quantity);
    const item = document.createElement('div');
    const stateClass = product.days < 0 ? 'overdue' : product.days <= 7 ? 'upcoming' : '';

    item.className = `home-due-item ${stateClass}`;
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.category)} · vence ${escapeHtml(formatShortDate(product.dueDate))}</span>
      </div>
      <strong>${formatCurrency(productTotal)}</strong>
    `;
    dom.homeDueList.appendChild(item);
  }
}

function renderTotals() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);

  dom.accountStatus.innerHTML = `
    <strong>Estado de cuenta: ${calculation.isPaid ? 'Pagada' : 'Pendiente'}</strong>
    <p>${calculation.paidPeople} de ${calculation.totalPeople} personas marcaron pago. Falta cobrar ${formatCurrency(calculation.pendingTotal)}.</p>
  `;

  dom.subtotalOutput.textContent = formatCurrency(calculation.subtotal);
  dom.tipOutput.textContent = formatCurrency(calculation.tipAmount);
  dom.grandTotalOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.paidTotalOutput.textContent = formatCurrency(calculation.paidTotal);
  dom.pendingTotalOutput.textContent = formatCurrency(calculation.pendingTotal);
  dom.mobileTotalOutput.textContent = formatCurrency(calculation.grandTotal);

  dom.personResults.innerHTML = '';

  if (bill.people.length === 0) {
    dom.personResults.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const row = document.createElement('div');
    row.className = 'result-row';
    const amount = calculation.finalTotals[person.id] || 0;
    const hasPhone = Boolean(normalizePhoneNumber(person.phone));
    row.innerHTML = `
      <span>${escapeHtml(person.name)} · ${person.paid ? 'Pagado' : 'Pendiente'}</span>
      <div class="result-actions">
        <strong>${formatCurrency(amount)}</strong>
        <button class="btn btn-light btn-small" type="button" ${hasPhone ? '' : 'disabled'}>WhatsApp</button>
      </div>
    `;

    row.querySelector('button').addEventListener('click', () => {
      openPersonWhatsapp(person.id, amount);
    });

    dom.personResults.appendChild(row);
  }
}

function renderTransfers() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  dom.transferList.innerHTML = '';

  const payer = bill.people.find((person) => person.id === bill.payerId);

  if (!payer) {
    dom.transferList.appendChild(emptyMessage('Selecciona un pagador principal para ver quién debe transferirle.'));
    return;
  }

  const debtors = bill.people.filter((person) => person.id !== payer.id && (calculation.finalTotals[person.id] || 0) > 0);

  if (debtors.length === 0) {
    dom.transferList.appendChild(emptyMessage('No hay transferencias pendientes para mostrar.'));
    return;
  }

  for (const person of debtors) {
    const amount = calculation.finalTotals[person.id] || 0;
    const row = document.createElement('div');
    row.className = 'transfer-row';
    row.innerHTML = `
      <span>${escapeHtml(person.name)} debe transferir a ${escapeHtml(payer.name)}</span>
      <strong>${formatCurrency(amount)}</strong>
    `;
    dom.transferList.appendChild(row);
  }
}

function emptyMessage(message) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `<strong>Sin datos</strong><p>${escapeHtml(message)}</p>`;
  return div;
}

function render() {
  renderQuickProducts();
  renderBillList();
  renderBillHeader();
  renderPayerSelect();
  renderPeople();
  renderProductForm();
  renderCategoryTotals();
  renderProducts();
  renderHomeDashboard();
  renderTotals();
  renderTransfers();

  if (!dom.shareModal.classList.contains('hidden')) {
    updateSharePreview();
  }
}

function getNextMonthValue(monthValue) {
  const [year, month] = String(monthValue || getCurrentMonthValue()).split('-').map(Number);
  const date = new Date(year, month, 1);
  return date.toISOString().slice(0, 7);
}

function duplicateHomeMonth() {
  const bill = getActiveBill();

  if (bill.mode !== 'home') {
    showToast('Esta opción es para cuentas del hogar.');
    return;
  }

  const personMap = new Map();
  const newPeople = bill.people.map((person) => {
    const newId = createId('person');
    personMap.set(person.id, newId);
    return { ...person, id: newId, paid: false };
  });

  const nextMonth = getNextMonthValue(bill.homeMonth);
  const createdAt = nowIso();

  const newBill = {
    ...bill,
    id: createId('bill'),
    name: `Hogar - ${nextMonth}`,
    homeMonth: nextMonth,
    payerId: bill.payerId ? personMap.get(bill.payerId) || '' : '',
    archived: false,
    createdAt,
    updatedAt: createdAt,
    people: newPeople,
    products: bill.products
      .filter((product) => product.recurring)
      .map((product) => {
        const dueDay = product.dueDate ? product.dueDate.slice(8, 10) : '';
        const newDueDate = dueDay ? `${nextMonth}-${dueDay}` : '';
        return {
          ...product,
          id: createId('product'),
          dueDate: newDueDate,
          consumers: product.consumers
            .filter((consumer) => personMap.has(consumer.personId))
            .map((consumer) => ({ personId: personMap.get(consumer.personId), share: consumer.share })),
        };
      }),
  };

  state.bills.unshift(newBill);
  state.activeBillId = newBill.id;
  editingProductId = null;
  saveState();
  render();
  showToast('Mes del hogar duplicado.');
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
    payerId: bill.payerId ? personMap.get(bill.payerId) || '' : '',
    archived: false,
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

function toggleArchiveBill() {
  const bill = getActiveBill();
  bill.archived = !bill.archived;
  persistAndRender();
  showToast(bill.archived ? 'Cuenta archivada.' : 'Cuenta desarchivada.');
}

function addPerson(name, phone = '') {
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
    phone: normalizePhoneNumber(phone),
    paid: false,
  });

  dom.personNameInput.value = '';
  dom.personPhoneInput.value = '';
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

  if (bill.payerId === personId) {
    bill.payerId = '';
  }

  persistAndRender();
}

function editPerson(personId) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    return;
  }

  const newName = prompt('Nombre de la persona:', person.name);

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

  const newPhone = prompt('Teléfono WhatsApp opcional. Ej: 56912345678', formatPhoneForDisplay(person.phone) || '');

  if (newPhone === null) {
    return;
  }

  person.name = cleanName;
  person.phone = normalizePhoneNumber(newPhone);
  persistAndRender();
}

function renamePerson(personId) {
  editPerson(personId);
}

function markAllPaid(paid) {
  const bill = getActiveBill();

  bill.people = bill.people.map((person) => ({ ...person, paid }));
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
  const category = CATEGORIES.includes(dom.productCategoryInput.value) ? dom.productCategoryInput.value : 'Otros';
  const splitMode = dom.productSplitModeInput.value === 'responsibles' ? 'responsibles' : 'participants';
  const dueDate = dom.productDueDateInput.value || '';
  const recurring = dom.productRecurringInput.checked;
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
      product.category = category;
      product.splitMode = splitMode;
      product.dueDate = dueDate;
      product.recurring = recurring;
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
      category,
      splitMode,
      dueDate,
      recurring,
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

function duplicateProduct(productId) {
  const bill = getActiveBill();
  const product = bill.products.find((item) => item.id === productId);

  if (!product) return;

  bill.products.push({
    ...product,
    id: createId('product'),
    name: `${product.name} copia`,
    consumers: product.consumers.map((consumer) => ({ ...consumer })),
  });

  persistAndRender();
  showToast('Producto duplicado.');
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
  dom.productCategoryInput.value = getActiveBill().mode === 'home' ? 'Luz' : 'Comida';
  dom.productSplitModeInput.value = getActiveBill().mode === 'home' ? 'responsibles' : 'participants';
  dom.productDueDateInput.value = '';
  dom.productRecurringInput.checked = false;
  dom.productFormTitle.textContent = 'Agregar producto';
  dom.productSubmitButton.textContent = 'Agregar producto';
  dom.cancelEditProductButton.classList.add('hidden');
}

function clearProducts() {
  const bill = getActiveBill();
  const confirmed = confirm('¿Limpiar todos los productos de esta cuenta?');

  if (!confirmed) return;

  bill.products = [];
  bill.quickTotal = 0;
  persistAndRender();
  showToast('Productos limpiados.');
}

function resetBill() {
  const bill = getActiveBill();
  const confirmed = confirm('¿Reiniciar esta cuenta? Se eliminarán personas, productos, pagador y pagos.');

  if (!confirmed) return;

  bill.people = [];
  bill.products = [];
  bill.payerId = '';
  bill.quickTotal = 0;
  bill.tipPercent = 10;
  bill.mode = 'detailed';
  persistAndRender();
  showToast('Cuenta reiniciada.');
}

function getShareOptions() {
  const format = document.querySelector('input[name="shareFormat"]:checked')?.value || 'text';
  const content = document.querySelector('input[name="shareContent"]:checked')?.value || 'simple';

  return { format, content };
}

function getTransferLines(bill, calculation) {
  const payer = bill.people.find((person) => person.id === bill.payerId);

  if (!payer) {
    return [];
  }

  return bill.people
    .filter((person) => person.id !== payer.id && (calculation.finalTotals[person.id] || 0) > 0)
    .map((person) => ({
      from: person.name,
      to: payer.name,
      amount: calculation.finalTotals[person.id] || 0,
      paid: person.paid,
    }));
}

function getSummaryText(content = 'simple') {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const lines = [
    `*Cuenta Clara - ${bill.name}*`,
    bill.mode === 'home' ? `Mes hogar: *${bill.homeMonth || getCurrentMonthValue()}*` : '',
    '',
  ].filter((line, index) => index !== 1 || line);

  if (content === 'detail') {
    for (const person of bill.people) {
      const detail = calculation.personDetails[person.id];
      lines.push(`*${person.name}: ${formatCurrency(detail.total)}*`);
      lines.push(`Estado: ${person.paid ? 'Pagado' : 'Pendiente'}`);

      if (detail.items.length > 0) {
        lines.push('Detalle:');
        for (const item of detail.items) {
          const shareText = item.totalShares > 1 ? ` (${item.share}/${item.totalShares} partes)` : '';
          const detailLabel = item.splitMode === 'responsibles' ? 'Responsable' : 'Detalle';
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

  if (bill.mode !== 'home') {
    lines.push(`Propina (${bill.tipPercent}%): ${formatCurrency(calculation.tipAmount)}`);
  }

  lines.push(`Total cuenta: *${formatCurrency(calculation.grandTotal)}*`);
  lines.push(`Total pagado: *${formatCurrency(calculation.paidTotal)}*`);
  lines.push(`Total pendiente: *${formatCurrency(calculation.pendingTotal)}*`);

  const transfers = getTransferLines(bill, calculation);

  if (transfers.length > 0) {
    lines.push('');
    lines.push('*Transferencias:*');

    for (const transfer of transfers) {
      lines.push(`*${transfer.from} debe transferir a ${transfer.to}: ${formatCurrency(transfer.amount)}*`);
    }
  }

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

function compactBillForLink(bill) {
  const people = bill.people.map((person) => ({
    name: person.name,
    phone: normalizePhoneNumber(person.phone || ''),
    paid: person.paid,
  }));

  const personIndex = new Map(bill.people.map((person, index) => [person.id, index]));

  return {
    v: 2,
    name: bill.name,
    mode: bill.mode,
    quickTotal: bill.quickTotal,
    homeMonth: bill.homeMonth,
    tipPercent: bill.tipPercent,
    payerIndex: bill.payerId && personIndex.has(bill.payerId) ? personIndex.get(bill.payerId) : null,
    people,
    products: bill.products.map((product) => ({
      name: product.name,
      unitPrice: product.unitPrice,
      quantity: product.quantity,
      category: product.category,
      splitMode: product.splitMode || 'participants',
      dueDate: product.dueDate || '',
      recurring: Boolean(product.recurring),
      consumers: product.consumers
        .filter((consumer) => personIndex.has(consumer.personId))
        .map((consumer) => ({
          personIndex: personIndex.get(consumer.personId),
          share: consumer.share,
        })),
    })),
  };
}

function billFromCompactLink(data) {
  const createdAt = nowIso();
  const people = Array.isArray(data.people)
    ? data.people.map((person) => ({
        id: createId('person'),
        name: String(person.name || 'Persona'),
        phone: normalizePhoneNumber(person.phone || ''),
        paid: Boolean(person.paid),
      }))
    : [];

  const bill = {
    id: createId('bill'),
    name: `${String(data.name || 'Cuenta compartida')} compartida`,
    mode: data.mode === 'quick' ? 'quick' : 'detailed',
    quickTotal: Number(data.quickTotal || 0),
    homeMonth: data.homeMonth || getCurrentMonthValue(),
    tipPercent: Number.isFinite(Number(data.tipPercent)) ? Number(data.tipPercent) : 10,
    payerId: Number.isInteger(data.payerIndex) && people[data.payerIndex] ? people[data.payerIndex].id : '',
    archived: false,
    createdAt,
    updatedAt: createdAt,
    people,
    products: [],
  };

  bill.products = Array.isArray(data.products)
    ? data.products.map((product) => ({
        id: createId('product'),
        name: String(product.name || 'Producto'),
        unitPrice: Number(product.unitPrice || 0),
        quantity: Number(product.quantity || 1),
        category: CATEGORIES.includes(product.category) ? product.category : 'Otros',
        splitMode: product.splitMode === 'responsibles' ? 'responsibles' : 'participants',
        dueDate: product.dueDate || '',
        recurring: Boolean(product.recurring),
        consumers: Array.isArray(product.consumers)
          ? product.consumers
              .filter((consumer) => people[consumer.personIndex])
              .map((consumer) => ({
                personId: people[consumer.personIndex].id,
                share: Math.max(1, Number(consumer.share || 1)),
              }))
          : [],
      }))
    : [];

  return bill;
}

function base64UrlEncode(text) {
  const utf8 = new TextEncoder().encode(text);
  let binary = '';

  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(encoded) {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((encoded.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function copyShareLink() {
  const bill = getActiveBill();
  const data = compactBillForLink(bill);
  const encoded = base64UrlEncode(JSON.stringify(data));
  const url = `${location.origin}${location.pathname}?cuenta=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast('Enlace copiado.');
  } catch {
    prompt('Copia el enlace:', url);
  }
}

function importBillFromUrl() {
  const params = new URLSearchParams(location.search);
  const encoded = params.get('cuenta');

  if (!encoded) {
    return;
  }

  try {
    const data = JSON.parse(base64UrlDecode(encoded));
    const bill = billFromCompactLink(data);

    state.bills.unshift(bill);
    state.activeBillId = bill.id;
    saveState();

    history.replaceState(null, '', location.pathname);
    showNotice('Cuenta importada', 'Se cargó una cuenta compartida desde el enlace.');
  } catch {
    showNotice('Enlace inválido', 'No se pudo cargar la cuenta compartida desde el enlace.');
  }
}

function exportBackup() {
  const payload = {
    exportedAt: nowIso(),
    app: 'Cuenta Clara',
    version: 2,
    state,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `cuenta-clara-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showToast('Respaldo exportado.');
}

function importBackupFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const importedState = payload.state || payload;

      const confirmed = confirm('¿Importar este respaldo? Reemplazará las cuentas guardadas en este navegador.');

      if (!confirmed) return;

      state = normalizeState(importedState);
      saveState();
      render();
      showToast('Respaldo importado.');
    } catch {
      showNotice('Respaldo inválido', 'No se pudo leer el archivo seleccionado.');
    }
  };

  reader.readAsText(file);
}




function safeFileName(name) {
  return String(name || 'cuenta-clara')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cuenta-clara';
}

function roundMoney(value) {
  return Math.round(Number(value) || 0);
}

function argb(hex) {
  return hex.replace('#', '').toUpperCase();
}

function styleTitleCell(cell, text) {
  cell.value = text;
  cell.font = { name: 'Arial', bold: true, size: 20, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function styleSectionCell(cell, text) {
  cell.value = text;
  cell.font = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF102A27' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4F1' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function styleButtonCell(cell, label, targetAddress) {
  cell.value = { text: label, hyperlink: targetAddress };
  cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' }, underline: false };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    left: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    bottom: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    right: { style: 'thin', color: { argb: 'FFB9DCD6' } },
  };
}

function styleHeaderRow(row) {
  row.height = 26;

  row.eachCell((cell) => {
    cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB9DCD6' } },
      left: { style: 'thin', color: { argb: 'FFB9DCD6' } },
      bottom: { style: 'thin', color: { argb: 'FFB9DCD6' } },
      right: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    };
  });
}

function styleDataRow(row, rowIndex) {
  const fillColor = rowIndex % 2 === 0 ? 'FFF8FAFA' : 'FFFFFFFF';
  row.height = row.height || 22;

  row.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, color: { argb: 'FF102A27' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      left: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      bottom: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      right: { style: 'thin', color: { argb: 'FFD9E8E5' } },
    };
  });
}

function styleStatusCell(cell, value) {
  const normalized = String(value || '').toLowerCase();
  const isPaid = normalized === 'pagado' || normalized === 'pagada';

  cell.font = {
    name: 'Arial',
    bold: true,
    size: 10,
    color: { argb: isPaid ? 'FF166534' : 'FF92400E' },
  };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: isPaid ? 'FFDCFCE7' : 'FFFEF3C7' },
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
}

function styleMoneyCell(cell) {
  const numericValue = typeof cell.value === 'number'
    ? cell.value
    : Number(String(cell.value || '').replace(/[^0-9,-]/g, '').replace(',', '.'));

  if (Number.isFinite(numericValue)) {
    cell.value = formatCurrency(roundMoney(numericValue));
  }

  cell.numFmt = '@';
  cell.alignment = { vertical: 'middle', horizontal: 'right' };
}

function stylePercentCell(cell) {
  cell.numFmt = '0.00%';
  cell.alignment = { vertical: 'middle', horizontal: 'right' };
}

function addStyledTable(sheet, startRow, headers, rows, moneyColumns = [], statusColumns = [], percentColumns = []) {
  const headerRow = sheet.getRow(startRow);

  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header;
  });

  styleHeaderRow(headerRow);

  rows.forEach((values, index) => {
    const row = sheet.getRow(startRow + 1 + index);

    values.forEach((value, valueIndex) => {
      row.getCell(valueIndex + 1).value = value;
    });

    styleDataRow(row, index);

    moneyColumns.forEach((columnNumber) => {
      styleMoneyCell(row.getCell(columnNumber));
    });

    statusColumns.forEach((columnNumber) => {
      styleStatusCell(row.getCell(columnNumber), row.getCell(columnNumber).value);
    });

    percentColumns.forEach((columnNumber) => {
      stylePercentCell(row.getCell(columnNumber));
    });
  });

  const endRow = startRow + rows.length;
  sheet.autoFilter = {
    from: { row: startRow, column: 1 },
    to: { row: Math.max(startRow, endRow), column: headers.length },
  };

  return endRow + 2;
}

function setSheetBaseStyle(sheet) {
  sheet.properties.defaultRowHeight = 20;

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (!cell.font) {
        cell.font = { name: 'Arial', size: 10 };
      }
    });
  });
}

function addInfoRow(sheet, rowNumber, label, value, isMoney = false) {
  const labelCell = sheet.getCell(`A${rowNumber}`);
  const valueCell = sheet.getCell(`B${rowNumber}`);

  labelCell.value = label;
  labelCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF526D68' } };
  labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4FBFA' } };
  labelCell.alignment = { vertical: 'middle', horizontal: 'left' };

  valueCell.value = isMoney ? formatCurrency(roundMoney(value)) : value;
  valueCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF102A27' } };
  valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  valueCell.alignment = { vertical: 'middle', horizontal: isMoney ? 'right' : 'left' };

  if (isMoney) {
    valueCell.numFmt = '@';
  }

  [labelCell, valueCell].forEach((cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      left: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      bottom: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      right: { style: 'thin', color: { argb: 'FFD9E8E5' } },
    };
  });
}

function addKpiCard(sheet, range, title, value, fillColor, valueIsMoney = true) {
  const [startCell] = range.split(':');
  sheet.mergeCells(range);

  const cell = sheet.getCell(startCell);
  cell.value = `${title}\n${valueIsMoney ? formatCurrency(roundMoney(value)) : value}`;
  cell.font = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF102A27' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(fillColor) } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    left: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    bottom: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    right: { style: 'thin', color: { argb: 'FFB9DCD6' } },
  };
}

function personDetailRows(person, bill, calculation) {
  const detail = calculation.personDetails[person.id];

  if (!detail.items.length) {
    return [[person.name, 'Sin consumos registrados', '', 0, 0, 0, '', person.paid ? 'Pagado' : 'Pendiente']];
  }

  return detail.items.map((item) => {
    const itemTip = item.amount * ((Number(bill.tipPercent) || 0) / 100);

    return [
      person.name,
      item.productName,
      item.category || 'Otros',
      roundMoney(item.amount),
      roundMoney(itemTip),
      roundMoney(item.amount + itemTip),
      `${item.share}/${item.totalShares}`,
      person.paid ? 'Pagado' : 'Pendiente',
    ];
  });
}

function addPersonFilterButtons(sheet, people, targetRows, firstRow) {
  styleSectionCell(sheet.getCell(`A${firstRow}`), 'Filtrar / ver por persona');
  sheet.mergeCells(`A${firstRow}:H${firstRow}`);

  const buttons = [{ label: 'Ver detalle completo', target: `#'Detalle por persona'!A${targetRows.all}` }];

  for (const person of people) {
    buttons.push({ label: person.name, target: `#'Detalle por persona'!A${targetRows[person.id]}` });
  }

  const buttonsPerRow = 4;

  buttons.forEach((button, index) => {
    const rowOffset = Math.floor(index / buttonsPerRow);
    const colOffset = index % buttonsPerRow;
    const rowNumber = firstRow + 1 + rowOffset;
    const startCol = colOffset * 2 + 1;
    const endCol = startCol + 1;
    const startAddress = sheet.getCell(rowNumber, startCol).address;
    const endAddress = sheet.getCell(rowNumber, endCol).address;

    if (startCol !== endCol) {
      sheet.mergeCells(`${startAddress}:${endAddress}`);
    }

    styleButtonCell(sheet.getCell(rowNumber, startCol), button.label, button.target);
    sheet.getRow(rowNumber).height = 26;
  });

  return firstRow + 1 + Math.ceil(buttons.length / buttonsPerRow) + 1;
}


function getExcelCellDisplayValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if (value.text) {
      return String(value.text);
    }

    if (value.richText) {
      return value.richText.map((part) => part.text || '').join('');
    }

    if (value.result !== undefined) {
      return String(value.result);
    }

    if (value.formula) {
      return String(value.formula);
    }

    return '';
  }

  return String(value);
}

function autoFitWorksheetColumns(sheet, options = {}) {
  const minWidth = options.minWidth || 10;
  const maxWidth = options.maxWidth || 34;
  const wideColumns = options.wideColumns || {};
  const narrowColumns = options.narrowColumns || {};
  const padding = options.padding || 2;

  sheet.columns.forEach((column, index) => {
    const columnNumber = index + 1;
    const columnLetter = column.letter;
    let maxLength = 0;

    column.eachCell({ includeEmpty: false }, (cell) => {
      // Ignorar títulos grandes combinados para que no agranden toda la hoja.
      if (cell.isMerged && cell.master && cell.address !== cell.master.address) {
        return;
      }

      const value = getExcelCellDisplayValue(cell.value);
      const longestLine = value
        .split(/\r?\n/)
        .reduce((longest, line) => Math.max(longest, line.length), 0);

      maxLength = Math.max(maxLength, longestLine);
    });

    const customMax = wideColumns[columnLetter] || wideColumns[columnNumber] || maxWidth;
    const customMin = narrowColumns[columnLetter] || narrowColumns[columnNumber] || minWidth;
    const calculatedWidth = Math.min(customMax, Math.max(customMin, maxLength + padding));

    column.width = calculatedWidth;
  });
}

function autoFitWorkbookSheets(workbook) {
  workbook.eachSheet((sheet) => {
    const name = sheet.name;

    if (name === 'Productos') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 10,
        maxWidth: 28,
        wideColumns: { F: 30, I: 36, J: 48 },
        narrowColumns: { D: 10, E: 14, G: 12 },
      });

      return;
    }

    if (name === 'Detalle por persona') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 10,
        maxWidth: 30,
        wideColumns: { B: 34 },
        narrowColumns: { G: 10, H: 14 },
      });

      return;
    }

    if (name === 'Resumen') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 12,
        maxWidth: 24,
        narrowColumns: { E: 14 },
      });

      return;
    }

    if (name === 'Transferencias') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 12,
        maxWidth: 26,
        narrowColumns: { C: 14, D: 14 },
      });

      return;
    }

    if (name === 'Categorías') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 12,
        maxWidth: 26,
        narrowColumns: { B: 14, C: 14 },
      });

      return;
    }

    autoFitWorksheetColumns(sheet);
  });
}


async function exportExcel() {
  if (typeof ExcelJS === 'undefined') {
    showNotice(
      'Excel profesional no disponible',
      'La exportación bonita usa ExcelJS desde internet. Prueba desde Vercel o revisa tu conexión.'
    );
    return;
  }

  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const transfers = getTransferLines(bill, calculation);
  const workbook = new ExcelJS.Workbook();
  const exportedAt = new Date();

  workbook.creator = 'Cuenta Clara';
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  workbook.subject = 'Resumen de cuenta';
  workbook.title = `Cuenta Clara - ${bill.name}`;

  const resumen = workbook.addWorksheet('Resumen', {
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  resumen.columns = [
    { width: 24 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
  ];

  resumen.mergeCells('A1:E2');
  styleTitleCell(resumen.getCell('A1'), `CUENTA CLARA · ${bill.name.toUpperCase()}`);
  resumen.getRow(1).height = 30;
  resumen.getRow(2).height = 30;

  styleSectionCell(resumen.getCell('A4'), 'Información general');
  resumen.mergeCells('A4:E4');

  addInfoRow(resumen, 5, 'Cuenta', bill.name);
  addInfoRow(resumen, 6, 'Fecha de exportación', exportedAt.toLocaleString('es-CL'));
  addInfoRow(resumen, 7, 'Modo', bill.mode === 'quick' ? 'Cuenta rápida' : 'Cuenta detallada');
  addInfoRow(resumen, 8, 'Pagador principal', payer ? payer.name : 'Sin pagador principal');
  addInfoRow(resumen, 9, 'Estado', calculation.isPaid ? 'Pagada' : 'Pendiente');

  addKpiCard(resumen, 'A11:A13', 'Subtotal', calculation.subtotal, '#E6F4F1');
  addKpiCard(resumen, 'B11:B13', `Propina ${bill.tipPercent}%`, calculation.tipAmount, '#FEF3C7');
  addKpiCard(resumen, 'C11:C13', 'Total final', calculation.grandTotal, '#CCFBF1');
  addKpiCard(resumen, 'D11:D13', 'Total pagado', calculation.paidTotal, '#DCFCE7');
  addKpiCard(resumen, 'E11:E13', 'Total pendiente', calculation.pendingTotal, '#FEE2E2');

  styleSectionCell(resumen.getCell('A15'), 'Detalle por persona');
  resumen.mergeCells('A15:E15');

  const resumenRows = bill.people.map((person) => {
    const detail = calculation.personDetails[person.id];

    return [
      person.name,
      roundMoney(detail.subtotal),
      roundMoney(detail.tip),
      roundMoney(detail.total),
      person.paid ? 'Pagado' : 'Pendiente',
    ];
  });

  addStyledTable(
    resumen,
    16,
    ['Persona', 'Subtotal', 'Propina', 'Total a pagar', 'Estado'],
    resumenRows.length ? resumenRows : [['Sin personas', 0, 0, 0, '']],
    [2, 3, 4],
    [5]
  );

  resumen.getCell('A9').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4FBFA' } };
  styleStatusCell(resumen.getCell('B9'), calculation.isPaid ? 'Pagada' : 'Pendiente');

  const productos = workbook.addWorksheet('Productos', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  productos.columns = [
    { width: 30 },
    { width: 16 },
    { width: 17 },
    { width: 12 },
    { width: 14 },
    { width: 95 },
  ];

  productos.mergeCells('A1:H2');
  styleTitleCell(productos.getCell('A1'), 'PRODUCTOS DE LA CUENTA');
  productos.getRow(1).height = 28;
  productos.getRow(2).height = 28;

  const productosRows = [];

  if (bill.mode === 'quick') {
    productosRows.push([
      'Cuenta rápida',
      'Otros',
      roundMoney(bill.quickTotal),
      1,
      roundMoney(bill.quickTotal),
      '',
      '',
      bill.people.map((person) => person.name).join(', '),
    ]);
  } else {
    for (const product of bill.products) {
      const consumers = product.consumers
        .map((consumer) => {
          const person = bill.people.find((item) => item.id === consumer.personId);
          return person ? `${person.name}${consumer.share > 1 ? ` (${consumer.share} partes)` : ''}` : null;
        })
        .filter(Boolean)
        .join(', ');

      productosRows.push([
        product.name,
        product.category || 'Otros',
        roundMoney(product.unitPrice),
        Number(product.quantity) || 0,
        roundMoney((Number(product.unitPrice) || 0) * (Number(product.quantity) || 0)),
        product.dueDate ? formatShortDate(product.dueDate) : '',
        product.recurring ? 'Sí' : 'No',
        consumers,
      ]);
    }
  }

  addStyledTable(
    productos,
    4,
    ['Producto', 'Categoría', 'Precio unitario', 'Cantidad', 'Total producto', 'Vencimiento', 'Recurrente', 'Consumidores'],
    productosRows.length ? productosRows : [['Sin productos', '', 0, 0, 0, '', '', '']],
    [3, 5],
    []
  );

  for (let rowNumber = 5; rowNumber <= 4 + Math.max(1, productosRows.length); rowNumber++) {
    productos.getRow(rowNumber).height = 38;
    productos.getCell(`E${rowNumber}`).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    productos.getCell(`H${rowNumber}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  }

  const detalle = workbook.addWorksheet('Detalle por persona', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  detalle.columns = [
    { width: 22 },
    { width: 30 },
    { width: 16 },
    { width: 18 },
    { width: 20 },
    { width: 20 },
    { width: 12 },
    { width: 16 },
  ];

  detalle.mergeCells('A1:H2');
  styleTitleCell(detalle.getCell('A1'), 'DETALLE POR PERSONA');
  detalle.getRow(1).height = 28;
  detalle.getRow(2).height = 28;

  const allDetailRows = bill.people.flatMap((person) => personDetailRows(person, bill, calculation));
  const buttonRowsCount = Math.ceil((bill.people.length + 1) / 4);
  const mainTableStart = 7 + buttonRowsCount;
  const mainTableEnd = mainTableStart + Math.max(1, allDetailRows.length);
  let sectionCursor = mainTableEnd + 3;
  const targetRows = { all: mainTableStart };

  for (const person of bill.people) {
    targetRows[person.id] = sectionCursor;
    sectionCursor += 2 + personDetailRows(person, bill, calculation).length + 2;
  }

  addPersonFilterButtons(detalle, bill.people, targetRows, 4);

  styleSectionCell(detalle.getCell(`A${mainTableStart - 1}`), 'Detalle completo');
  detalle.mergeCells(`A${mainTableStart - 1}:H${mainTableStart - 1}`);

  addStyledTable(
    detalle,
    mainTableStart,
    ['Persona', 'Producto', 'Categoría', 'Monto asignado', 'Propina proporcional', 'Total con propina', 'Partes', 'Estado'],
    allDetailRows.length ? allDetailRows : [['Sin personas', '', '', 0, 0, 0, '', '']],
    [4, 5, 6],
    [8]
  );

  sectionCursor = mainTableEnd + 3;

  for (const person of bill.people) {
    const rows = personDetailRows(person, bill, calculation);
    styleSectionCell(detalle.getCell(`A${sectionCursor}`), `Detalle de ${person.name}`);
    detalle.mergeCells(`A${sectionCursor}:H${sectionCursor}`);

    addStyledTable(
      detalle,
      sectionCursor + 1,
      ['Persona', 'Producto', 'Categoría', 'Monto asignado', 'Propina proporcional', 'Total con propina', 'Partes', 'Estado'],
      rows,
      [4, 5, 6],
      [8]
    );

    sectionCursor += 2 + rows.length + 2;
  }

  const transferencias = workbook.addWorksheet('Transferencias', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  transferencias.columns = [
    { width: 26 },
    { width: 26 },
    { width: 18 },
    { width: 16 },
  ];

  transferencias.mergeCells('A1:D2');
  styleTitleCell(transferencias.getCell('A1'), 'TRANSFERENCIAS');
  transferencias.getRow(1).height = 28;
  transferencias.getRow(2).height = 28;

  const transferRows = transfers.length
    ? transfers.map((transfer) => [transfer.from, transfer.to, roundMoney(transfer.amount), transfer.paid ? 'Pagado' : 'Pendiente'])
    : [['Sin transferencias', payer ? payer.name : 'Sin pagador', 0, '']];

  addStyledTable(
    transferencias,
    4,
    ['Debe transferir', 'A quién', 'Monto', 'Estado'],
    transferRows,
    [3],
    [4]
  );

  const categorias = workbook.addWorksheet('Categorías', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  categorias.columns = [
    { width: 28 },
    { width: 18 },
    { width: 18 },
  ];

  categorias.mergeCells('A1:C2');
  styleTitleCell(categorias.getCell('A1'), 'TOTALES POR CATEGORÍA');
  categorias.getRow(1).height = 28;
  categorias.getRow(2).height = 28;

  const categoryRows = Object.entries(calculation.categoryTotals)
    .filter(([, total]) => total > 0)
    .map(([category, total]) => {
      const roundedTotal = roundMoney(total);
      const percent = calculation.subtotal > 0 ? total / calculation.subtotal : 0;
      return [category, roundedTotal, percent];
    });

  addStyledTable(
    categorias,
    4,
    ['Categoría', 'Total', '% del subtotal'],
    categoryRows.length ? categoryRows : [['Sin categorías registradas', 0, 0]],
    [2],
    [],
    [3]
  );

  for (let rowNumber = 5; rowNumber <= 4 + Math.max(1, categoryRows.length); rowNumber++) {
    stylePercentCell(categorias.getCell(`C${rowNumber}`));
  }

  workbook.eachSheet((sheet) => {
    setSheetBaseStyle(sheet);
  });

  autoFitWorkbookSheets(workbook);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${safeFileName(bill.name)}-cuenta-clara.xlsx`;
  link.click();

  URL.revokeObjectURL(url);
  showToast('Excel profesional exportado.');
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
    transfers: getTransferLines(bill, calculation),
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
  const transferHeight = data.transfers.length > 0 ? 80 + data.transfers.length * 38 : 0;
  const height = Math.max(900, 420 + data.people.length * personBlockBase + extraItems + transferHeight);

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

  if (data.transfers.length > 0) {
    y += 8;
    const blockHeight = 72 + data.transfers.length * 38;

    ctx.fillStyle = '#fff7ed';
    roundRect(ctx, padding, y, width - padding * 2, blockHeight, 24);
    ctx.fill();

    ctx.fillStyle = '#102a27';
    ctx.font = '800 27px Arial';
    ctx.fillText('Transferencias', padding + 28, y + 44);

    let ty = y + 82;
    ctx.font = '700 21px Arial';

    for (const transfer of data.transfers) {
      ctx.fillStyle = '#102a27';
      ctx.fillText(`${transfer.from} → ${transfer.to}`, padding + 28, ty);

      ctx.fillStyle = '#0f766e';
      const amount = formatCurrency(transfer.amount);
      ctx.fillText(amount, width - padding - 28 - ctx.measureText(amount).width, ty);
      ty += 38;
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


function updateInstallButton() {
  if (!dom.installAppButton) {
    return;
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    dom.installAppButton.textContent = 'App instalada';
    dom.installAppButton.disabled = true;
    return;
  }

  dom.installAppButton.textContent = 'Instalar App';
  dom.installAppButton.disabled = false;
}

async function installApp() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    showToast('La app ya está instalada.');
    return;
  }

  if (!deferredInstallPrompt) {
    showNotice(
      'Instalar Cuenta Clara',
      'Si el navegador no abre la instalación automáticamente, usa el menú del navegador y elige “Instalar app” o “Agregar a pantalla de inicio”. En Chrome o Edge suele aparecer al usar el sitio desde Vercel.'
    );
    return;
  }

  deferredInstallPrompt.prompt();

  const choice = await deferredInstallPrompt.userChoice;

  if (choice.outcome === 'accepted') {
    showToast('Instalación iniciada.');
  } else {
    showToast('Instalación cancelada.');
  }

  deferredInstallPrompt = null;
  updateInstallButton();
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallButton();
  showToast('Cuenta Clara quedó instalada.');
});


function initServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

dom.closeNoticeTabButton.addEventListener('click', () => dom.noticeTab.classList.add('hidden'));


dom.authButton.addEventListener('click', openAuthModal);
dom.closeAuthModalButton.addEventListener('click', closeAuthModal);
dom.authModal.addEventListener('click', (event) => {
  if (event.target === dom.authModal) {
    closeAuthModal();
  }
});
dom.showLoginButton.addEventListener('click', showLoginForm);
dom.showRegisterButton.addEventListener('click', showRegisterForm);
dom.loginForm.addEventListener('submit', loginLocalUser);
dom.registerForm.addEventListener('submit', registerLocalUser);
dom.continueGuestButton.addEventListener('click', switchToGuestMode);
dom.switchToGuestButton.addEventListener('click', switchToGuestMode);
dom.logoutButton.addEventListener('click', logoutLocalUser);

dom.installAppButton.addEventListener('click', installApp);
dom.themeToggle.addEventListener('click', toggleTheme);
dom.newBillButton.addEventListener('click', addBill);
dom.duplicateBillButton.addEventListener('click', duplicateBill);
dom.archiveBillButton.addEventListener('click', toggleArchiveBill);
dom.deleteBillButton.addEventListener('click', deleteActiveBill);

dom.historySearchInput.addEventListener('input', renderBillList);
dom.historyFilterSelect.addEventListener('change', renderBillList);

dom.billNameInput.addEventListener('input', () => {
  const bill = getActiveBill();
  bill.name = dom.billNameInput.value;
  touchActiveBill();
  saveState();
});

dom.billNameInput.addEventListener('blur', () => {
  const bill = getActiveBill();
  const cleanName = dom.billNameInput.value.trim();

  bill.name = cleanName || 'Nueva cuenta';
  persistAndRender();
});

document.querySelectorAll('input[name="billMode"]').forEach((input) => {
  input.addEventListener('change', () => {
    const bill = getActiveBill();
    bill.mode = input.value;
    if (bill.mode === 'home') {
      if (!bill.homeMonth) {
        bill.homeMonth = getCurrentMonthValue();
      }
      bill.tipPercent = 0;
    }
    persistAndRender();
  });
});

dom.quickTotalInput.addEventListener('input', () => {
  const bill = getActiveBill();
  const value = Number(dom.quickTotalInput.value);

  bill.quickTotal = Number.isFinite(value) && value >= 0 ? value : 0;
  persistAndRender();
});

dom.homeMonthInput.addEventListener('input', () => {
  const bill = getActiveBill();
  bill.homeMonth = dom.homeMonthInput.value || getCurrentMonthValue();
  persistAndRender();
});

dom.duplicateHomeMonthButton.addEventListener('click', duplicateHomeMonth);

dom.payerSelect.addEventListener('change', () => {
  const bill = getActiveBill();
  bill.payerId = dom.payerSelect.value;
  persistAndRender();
});

dom.personForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addPerson(dom.personNameInput.value, dom.personPhoneInput.value);
});

dom.markAllPaidButton.addEventListener('click', () => markAllPaid(true));
dom.markAllPendingButton.addEventListener('click', () => markAllPaid(false));

dom.tipPercentInput.addEventListener('input', () => {
  const bill = getActiveBill();
  const value = Number(dom.tipPercentInput.value);

  bill.tipPercent = bill.mode === 'home' ? 0 : (Number.isFinite(value) && value >= 0 ? value : 0);
  persistAndRender();
});

dom.quickTipButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const bill = getActiveBill();
    if (bill.mode === 'home') {
      bill.tipPercent = 0;
    } else {
      bill.tipPercent = Number(button.dataset.tip);
    }
    persistAndRender();
  });
});

dom.clearProductsButton.addEventListener('click', clearProducts);
dom.resetBillButton.addEventListener('click', resetBill);

dom.selectAllConsumersButton.addEventListener('click', () => {
  const checkboxes = [...dom.consumerList.querySelectorAll('input[type="checkbox"]')];
  const shouldSelect = checkboxes.some((checkbox) => !checkbox.checked);

  for (const checkbox of checkboxes) {
    checkbox.checked = shouldSelect;
    const shareInput = checkbox.closest('.consumer-row').querySelector('input[type="number"]');
    shareInput.disabled = !shouldSelect;
  }
});

dom.toggleQuickProductsEditorButton.addEventListener('click', () => {
  const isHidden = dom.quickProductsEditor.classList.toggle('hidden');
  dom.toggleQuickProductsEditorButton.textContent = isHidden ? 'Editar rápidos' : 'Ocultar editor';
});

dom.quickProductForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addQuickProduct(dom.quickProductNameInput.value, dom.quickProductCategoryInput.value);
});

dom.productSplitModeInput.addEventListener('change', updateDivisionCopy);

dom.productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitProduct();
});

dom.cancelEditProductButton.addEventListener('click', () => {
  resetProductForm();
  renderProductForm();
});

dom.productSearchInput.addEventListener('input', renderProducts);
dom.productFilterSelect.addEventListener('change', renderProducts);

dom.copySummaryButton.addEventListener('click', () => copySummary('simple'));
dom.whatsappButton.addEventListener('click', () => shareWhatsapp('simple'));
dom.shareButton.addEventListener('click', openShareModal);
dom.shareLinkButton.addEventListener('click', copyShareLink);
dom.exportExcelButton.addEventListener('click', exportExcel);
dom.mobileShareButton.addEventListener('click', openShareModal);
dom.mobileAddProductButton.addEventListener('click', () => {
  const bill = getActiveBill();

  if (bill.mode === 'quick') {
    dom.quickTotalInput.focus();
    dom.quickTotalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    dom.productNameInput.focus();
    dom.productEditorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

dom.exportBackupButton.addEventListener('click', exportBackup);
dom.importBackupButton.addEventListener('click', () => dom.backupFileInput.click());
dom.backupFileInput.addEventListener('change', () => {
  importBackupFile(dom.backupFileInput.files[0]);
  dom.backupFileInput.value = '';
});

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

  if (event.key === 'Escape' && !dom.authModal.classList.contains('hidden')) {
    closeAuthModal();
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
updateInstallButton();
loadAuthSession();
loadState();
migrateEmptyDefaultPeople();
importBillFromUrl();
saveState();
render();
initServiceWorker();
