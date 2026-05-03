console.info('Cuenta Clara V10.9 cargada');
const GUEST_STORAGE_KEY = 'cuenta-clara-v1-state';
const AUTH_SESSION_KEY = 'cuenta-clara-auth-session';
const EXPERIENCE_MODE_KEY = 'cuenta-clara-experience-mode';
const APP_SECTION_KEY = 'cuenta-clara-active-section';
let activeStorageKey = GUEST_STORAGE_KEY;
let currentSession = { mode: 'guest', email: '', name: '', userId: '' };
let cloudSaveTimer = null;
let isCloudLoading = false;
let lastCloudSyncAt = null;
let cloudSyncStatus = 'local';
let cloudSyncErrorNotified = false;
let accountSettingsPinnedOpenBillId = '';
let suppressAccountSettingsToggle = false;
let sharedSaveTimer = null;
let sharedAccountsCache = [];
let sharedInvitesCache = [];
let sharedUiBusy = false;
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
  syncStatusBadge: document.querySelector('#syncStatusBadge'),
  newBillButton: document.querySelector('#newBillButton'),
  duplicateBillButton: document.querySelector('#duplicateBillButton'),
  archiveBillButton: document.querySelector('#archiveBillButton'),
  deleteBillButton: document.querySelector('#deleteBillButton'),
  billList: document.querySelector('#billList'),
  billNameInput: document.querySelector('#billNameInput'),
  billMeta: document.querySelector('#billMeta'),
  currentListName: document.querySelector('#currentListName'),
  currentListMeta: document.querySelector('#currentListMeta'),
  accountSettingsPanel: document.querySelector('#accountSettingsPanel'),
  accountSettingsSummaryText: document.querySelector('#accountSettingsSummaryText'),

  guidedStartCard: document.querySelector('#guidedStartCard'),
  guidedChoiceButtons: document.querySelectorAll('[data-guided-mode]'),
  sectionNavButtons: document.querySelectorAll('[data-app-section]'),
  appSectionPanels: document.querySelectorAll('[data-app-section-panel]'),
  guidedNextTitle: document.querySelector('#guidedNextTitle'),
  guidedNextHelp: document.querySelector('#guidedNextHelp'),
  smartActionButton: document.querySelector('#smartActionButton'),
  simpleModeButton: document.querySelector('#simpleModeButton'),
  advancedModeButton: document.querySelector('#advancedModeButton'),
  stepPeople: document.querySelector('#stepPeople'),
  stepProducts: document.querySelector('#stepProducts'),
  stepReview: document.querySelector('#stepReview'),
  stepShare: document.querySelector('#stepShare'),

  historySearchInput: document.querySelector('#historySearchInput'),
  historyFilterSelect: document.querySelector('#historyFilterSelect'),
  exportBackupButton: document.querySelector('#exportBackupButton'),
  importBackupButton: document.querySelector('#importBackupButton'),
  backupFileInput: document.querySelector('#backupFileInput'),

  personForm: document.querySelector('#personForm'),
  personNameInput: document.querySelector('#personNameInput'),
  personPhoneInput: document.querySelector('#personPhoneInput'),
  peopleList: document.querySelector('#peopleList'),
  selfParticipantCard: document.querySelector('#selfParticipantCard'),
  addMePersonButton: document.querySelector('#addMePersonButton'),
  markAllPaidButton: document.querySelector('#markAllPaidButton'),
  markAllPendingButton: document.querySelector('#markAllPendingButton'),
  openFriendsPickerButton: document.querySelector('#openFriendsPickerButton'),
  friendsPickerModal: document.querySelector('#friendsPickerModal'),
  closeFriendsPickerButton: document.querySelector('#closeFriendsPickerButton'),
  friendsPickerList: document.querySelector('#friendsPickerList'),
  addSelectedFriendsButton: document.querySelector('#addSelectedFriendsButton'),

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

  createRecurringGroupButton: document.querySelector('#createRecurringGroupButton'),
  createNextRecurringMonthButton: document.querySelector('#createNextRecurringMonthButton'),
  createNextRecurringMonthButtonInline: document.querySelector('#createNextRecurringMonthButtonInline'),
  recurringGroupsList: document.querySelector('#recurringGroupsList'),
  recurringDashboardCard: document.querySelector('#recurringDashboardCard'),
  recurringDashboardTitle: document.querySelector('#recurringDashboardTitle'),
  recurringDashboardHelp: document.querySelector('#recurringDashboardHelp'),
  recurringCurrentMonthOutput: document.querySelector('#recurringCurrentMonthOutput'),
  recurringMonthsOutput: document.querySelector('#recurringMonthsOutput'),
  recurringCarryoverOutput: document.querySelector('#recurringCarryoverOutput'),
  recurringPendingOutput: document.querySelector('#recurringPendingOutput'),
  recurringActiveMonthTitle: document.querySelector('#recurringActiveMonthTitle'),
  recurringActiveMonthStatus: document.querySelector('#recurringActiveMonthStatus'),
  recurringCurrentPeopleList: document.querySelector('#recurringCurrentPeopleList'),
  recurringDebtList: document.querySelector('#recurringDebtList'),
  recurringMonthHistoryList: document.querySelector('#recurringMonthHistoryList'),

  publishSharedAccountButton: document.querySelector('#publishSharedAccountButton'),
  inviteSharedUserButton: document.querySelector('#inviteSharedUserButton'),
  refreshSharedAccountsButton: document.querySelector('#refreshSharedAccountsButton'),
  sharedInviteSearchInput: document.querySelector('#sharedInviteSearchInput'),
  sharedAccountStatus: document.querySelector('#sharedAccountStatus'),
  sharedInvitesList: document.querySelector('#sharedInvitesList'),
  sharedAccountsList: document.querySelector('#sharedAccountsList'),

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
  splitModeHelp: document.querySelector('#splitModeHelp'),
  manualProductMethodButton: document.querySelector('#manualProductMethodButton'),
  receiptMethodButton: document.querySelector('#receiptMethodButton'),
  quickProductMethodButton: document.querySelector('#quickProductMethodButton'),
  productDueDateInput: document.querySelector('#productDueDateInput'),
  productRecurringInput: document.querySelector('#productRecurringInput'),
  consumerPanelTitle: document.querySelector('#consumerPanelTitle'),
  consumerPanelHelp: document.querySelector('#consumerPanelHelp'),
  consumerList: document.querySelector('#consumerList'),
  selectAllConsumersButton: document.querySelector('#selectAllConsumersButton'),
  cancelEditProductButton: document.querySelector('#cancelEditProductButton'),
  productSubmitButton: document.querySelector('#productSubmitButton'),
  receiptButton: document.querySelector('#receiptButton'),
  receiptModal: document.querySelector('#receiptModal'),
  closeReceiptModalButton: document.querySelector('#closeReceiptModalButton'),
  receiptFileInput: document.querySelector('#receiptFileInput'),
  receiptPreviewWrap: document.querySelector('#receiptPreviewWrap'),
  receiptPreviewImage: document.querySelector('#receiptPreviewImage'),
  processReceiptButton: document.querySelector('#processReceiptButton'),
  clearReceiptButton: document.querySelector('#clearReceiptButton'),
  receiptStatus: document.querySelector('#receiptStatus'),
  receiptDetectedBody: document.querySelector('#receiptDetectedBody'),
  receiptRawTextInput: document.querySelector('#receiptRawTextInput'),
  reparseReceiptTextButton: document.querySelector('#reparseReceiptTextButton'),
  receiptDetectedCount: document.querySelector('#receiptDetectedCount'),
  selectAllReceiptItemsButton: document.querySelector('#selectAllReceiptItemsButton'),
  unselectAllReceiptItemsButton: document.querySelector('#unselectAllReceiptItemsButton'),
  addReceiptItemsButton: document.querySelector('#addReceiptItemsButton'),
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
  sidebarGrandTotalOutput: document.querySelector('#sidebarGrandTotalOutput'),
  paidTotalOutput: document.querySelector('#paidTotalOutput'),
  pendingTotalOutput: document.querySelector('#pendingTotalOutput'),
  personResults: document.querySelector('#personResults'),
  profilePayerSummary: document.querySelector('#profilePayerSummary'),
  profilePayerTitle: document.querySelector('#profilePayerTitle'),
  profilePayerHelp: document.querySelector('#profilePayerHelp'),
  profilePayerPaidOutput: document.querySelector('#profilePayerPaidOutput'),
  profilePayerOwnOutput: document.querySelector('#profilePayerOwnOutput'),
  profilePayerReceivableOutput: document.querySelector('#profilePayerReceivableOutput'),
  profilePayerDebtorsList: document.querySelector('#profilePayerDebtorsList'),
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
  profileAvatar: document.querySelector('#profileAvatar'),
  profileTabs: document.querySelectorAll('[data-profile-tab]'),
  profilePanel: document.querySelector('#profilePanel'),
  profileStatsPanel: document.querySelector('#profileStatsPanel'),
  profileSettingsPanel: document.querySelector('#profileSettingsPanel'),
  profileNickInput: document.querySelector('#profileNickInput'),
  profileNameInput: document.querySelector('#profileNameInput'),
  profilePhoneInput: document.querySelector('#profilePhoneInput'),
  profileEmailInput: document.querySelector('#profileEmailInput'),
  profileCurrencyInput: document.querySelector('#profileCurrencyInput'),
  profileThemePreferenceInput: document.querySelector('#profileThemePreferenceInput'),
  saveProfileButton: document.querySelector('#saveProfileButton'),
  savePreferencesButton: document.querySelector('#savePreferencesButton'),
  syncNowButton: document.querySelector('#syncNowButton'),
  statTotalBills: document.querySelector('#statTotalBills'),
  statActiveBills: document.querySelector('#statActiveBills'),
  statHistoricalTotal: document.querySelector('#statHistoricalTotal'),
  statAverageBill: document.querySelector('#statAverageBill'),
  statPeopleCount: document.querySelector('#statPeopleCount'),
  statProductCount: document.querySelector('#statProductCount'),
  statHomeBills: document.querySelector('#statHomeBills'),
  statOutingBills: document.querySelector('#statOutingBills'),
  statTopCategories: document.querySelector('#statTopCategories'),
  statTopPeople: document.querySelector('#statTopPeople'),
  statLastActivity: document.querySelector('#statLastActivity'),

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
  profile: {},
};

let editingProductId = null;
let receiptSelectedFile = null;
let receiptDetectedItems = [];
let friendsPickerItems = [];
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


function hasSupabaseClient() {
  return typeof supabaseClient !== 'undefined' && Boolean(supabaseClient?.auth);
}

function getCloudSyncErrorMessage(error) {
  const code = String(error?.code || '').trim();
  const rawMessage = String(error?.message || error?.details || error?.hint || error || '').trim();
  const message = rawMessage.toLowerCase();

  if (code === '42P01' || message.includes('app_states') || message.includes('does not exist') || message.includes('relation')) {
    return 'La tabla app_states no está disponible. Ejecuta sql/01-supabase-app-state.sql en Supabase → SQL Editor y vuelve a probar.';
  }

  if (code === '42501' || message.includes('row-level security') || message.includes('permission denied') || message.includes('policy')) {
    return 'Supabase está bloqueando el guardado por permisos/RLS. Vuelve a ejecutar sql/01-supabase-app-state.sql para recrear las políticas de app_states.';
  }

  if (message.includes('jwt') || message.includes('not authenticated') || message.includes('auth')) {
    return 'La sesión de Supabase no está activa. Cierra sesión, vuelve a ingresar y presiona Guardar ahora.';
  }

  return rawMessage
    ? `Los cambios siguen guardados localmente. Detalle: ${rawMessage}`
    : 'Los cambios siguen guardados localmente. Revisa conexión, sesión de usuario y la tabla app_states en Supabase.';
}

function notifyCloudSyncError(title, error) {
  console.error(error);
  setSyncStatus('error', 'Guardado local');

  if (!cloudSyncErrorNotified) {
    showNotice(title, getCloudSyncErrorMessage(error));
    cloudSyncErrorNotified = true;
  }
}



function getUserStorageKey(identifier) {
  return `cuenta-clara-supabase-state:${String(identifier || '').trim()}`;
}

function setGuestSession() {
  currentSession = { mode: 'guest', email: '', name: '', userId: '' };
  activeStorageKey = GUEST_STORAGE_KEY;
  clearTimeout(cloudSaveTimer);
}

function setUserSession(user) {
  const name = user?.user_metadata?.nick || user?.user_metadata?.nombre || user?.email || 'Usuario';

  currentSession = {
    mode: 'user',
    email: user?.email || '',
    name,
    userId: user?.id || '',
  };

  activeStorageKey = getUserStorageKey(currentSession.userId || currentSession.email);
}

function saveAuthSession() {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  setGuestSession();
}

async function initializeAuthSession() {
  if (!hasSupabaseClient()) {
    setGuestSession();
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data?.session?.user) {
    setGuestSession();
    return;
  }

  setUserSession(data.session.user);
  saveAuthSession();
}

async function loadAuthSession() {
  await initializeAuthSession();
}

async function saveCloudStateNow(options = {}) {
  const force = Boolean(options.force);

  if (!hasSupabaseClient() || currentSession.mode !== 'user' || !currentSession.userId) {
    return false;
  }

  if (isCloudLoading && !force) {
    return false;
  }

  try {
    state = normalizeState(state);

    try {
      localStorage.setItem(activeStorageKey, JSON.stringify(state));
    } catch (storageError) {
      console.warn('No se pudo actualizar la copia local antes de sincronizar:', storageError);
    }

    setSyncStatus('saving', options.message || 'Guardando...');

    const { error } = await supabaseClient
      .from('app_states')
      .upsert({
        user_id: currentSession.userId,
        state,
        updated_at: nowIso(),
      }, { onConflict: 'user_id' });

    if (error) {
      notifyCloudSyncError('No se pudo guardar en la nube', error);
      return false;
    }

    cloudSyncErrorNotified = false;
    await savePublicProfileFromMain();
    lastCloudSyncAt = nowIso();
    setSyncStatus('saved', getCloudSavedText());
    renderAuthUI();
    return true;
  } catch (error) {
    notifyCloudSyncError('Error de sincronización', error);
    return false;
  }
}

function scheduleCloudSave() {
  if (currentSession.mode !== 'user' || !currentSession.userId || isCloudLoading) {
    return;
  }

  setSyncStatus('saving', 'Guardando...');
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    saveCloudStateNow({ silent: true }).catch((error) => {
      notifyCloudSyncError('Error de sincronización', error);
    });
  }, 180);
}

async function loadCloudState() {
  if (!hasSupabaseClient() || currentSession.mode !== 'user' || !currentSession.userId) {
    return false;
  }

  isCloudLoading = true;

  try {
    setSyncStatus('saving', 'Cargando nube...');

    const { data, error } = await supabaseClient
      .from('app_states')
      .select('state, updated_at')
      .eq('user_id', currentSession.userId)
      .maybeSingle();

    if (error) {
      notifyCloudSyncError('No se pudo cargar la nube', error);
      return false;
    }

    if (data?.state) {
      state = normalizeState(data.state);
      localStorage.setItem(activeStorageKey, JSON.stringify(state));
      lastCloudSyncAt = data.updated_at || nowIso();
      cloudSyncErrorNotified = false;
      setSyncStatus('saved', getCloudSavedText());
      return true;
    }

    const localSaved = localStorage.getItem(activeStorageKey);
    const guestSaved = localStorage.getItem(GUEST_STORAGE_KEY);
    const fallbackState = localSaved || guestSaved;
    state = normalizeState(fallbackState ? JSON.parse(fallbackState) : state);
    localStorage.setItem(activeStorageKey, JSON.stringify(state));

    isCloudLoading = false;
    await saveCloudStateNow({ force: true, message: 'Creando respaldo...' });
    return true;
  } catch (error) {
    notifyCloudSyncError('Error de sincronización', error);
    return false;
  } finally {
    isCloudLoading = false;
  }
}



function setProfileTab(tabName = 'profile') {
  const panels = {
    profile: dom.profilePanel,
    stats: dom.profileStatsPanel,
    settings: dom.profileSettingsPanel,
  };

  Object.entries(panels).forEach(([key, panel]) => {
    panel?.classList.toggle('hidden', key !== tabName);
  });

  dom.profileTabs?.forEach((button) => {
    button.classList.toggle('active', button.dataset.profileTab === tabName);
  });
}

function renderMiniRanking(container, entries, emptyText) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text';
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  entries.slice(0, 5).forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'mini-ranking-row';
    row.innerHTML = `
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    `;
    container.appendChild(row);
  });
}

function getUsageStats() {
  const bills = Array.isArray(state.bills) ? state.bills : [];
  const stats = {
    totalBills: bills.length,
    activeBills: bills.filter((bill) => !bill.archived).length,
    archivedBills: bills.filter((bill) => bill.archived).length,
    historicalTotal: 0,
    averageBill: 0,
    peopleCount: 0,
    productCount: 0,
    homeBills: 0,
    outingBills: 0,
    topCategories: new Map(),
    topPeople: new Map(),
    lastActivity: null,
  };

  for (const bill of bills) {
    const calculation = calculateBill(bill);
    stats.historicalTotal += calculation.grandTotal || 0;
    stats.peopleCount += Array.isArray(bill.people) ? bill.people.length : 0;
    stats.productCount += Array.isArray(bill.products) ? bill.products.length : 0;

    if (bill.mode === 'home') {
      stats.homeBills += 1;
    } else {
      stats.outingBills += 1;
    }

    for (const [category, total] of Object.entries(calculation.categoryTotals || {})) {
      if (total > 0) {
        stats.topCategories.set(category, (stats.topCategories.get(category) || 0) + Math.round(total));
      }
    }

    for (const person of bill.people || []) {
      const key = person.name || 'Persona';
      stats.topPeople.set(key, (stats.topPeople.get(key) || 0) + 1);
    }

    const activity = bill.updatedAt || bill.createdAt;
    if (activity && (!stats.lastActivity || new Date(activity) > new Date(stats.lastActivity))) {
      stats.lastActivity = activity;
    }
  }

  stats.averageBill = stats.totalBills > 0 ? stats.historicalTotal / stats.totalBills : 0;
  stats.topCategories = [...stats.topCategories.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => [label, formatCurrency(value)]);
  stats.topPeople = [...stats.topPeople.entries()].sort((a, b) => b[1] - a[1]);

  return stats;
}

function renderProfilePanels() {
  const isUser = currentSession.mode === 'user';

  if (!isUser || !dom.profileNickInput) {
    return;
  }

  const profile = getProfile();
  const displayName = getProfileDisplayName();
  const activeElement = document.activeElement;
  const editableFields = [
    dom.profileNickInput,
    dom.profileNameInput,
    dom.profilePhoneInput,
    dom.profileCurrencyInput,
    dom.profileThemePreferenceInput,
  ];

  if (!editableFields.includes(activeElement)) {
    dom.profileNickInput.value = profile.nick || '';
    dom.profileNameInput.value = profile.name || '';
    dom.profilePhoneInput.value = profile.phone ? formatPhoneForDisplay(profile.phone) : '';
    dom.profileEmailInput.value = currentSession.email || '';
    dom.profileCurrencyInput.value = profile.currency || 'CLP';
    dom.profileThemePreferenceInput.value = profile.themePreference || 'system';
  }

  if (dom.profileAvatar) {
    if (profile.avatarDataUrl) {
      dom.profileAvatar.innerHTML = `<img src="${profile.avatarDataUrl}" alt="Foto de perfil" />`;
    } else {
      dom.profileAvatar.textContent = getInitials(displayName);
    }
  }

  const stats = getUsageStats();

  dom.statTotalBills.textContent = stats.totalBills;
  dom.statActiveBills.textContent = stats.activeBills;
  dom.statHistoricalTotal.textContent = formatCurrency(stats.historicalTotal);
  dom.statAverageBill.textContent = formatCurrency(stats.averageBill);
  dom.statPeopleCount.textContent = stats.peopleCount;
  dom.statProductCount.textContent = stats.productCount;
  dom.statHomeBills.textContent = stats.homeBills;
  dom.statOutingBills.textContent = stats.outingBills;
  dom.statLastActivity.textContent = stats.lastActivity
    ? `Última actividad: ${formatDate(stats.lastActivity)}`
    : 'Sin actividad registrada.';

  renderMiniRanking(dom.statTopCategories, stats.topCategories, 'Sin categorías todavía.');
  renderMiniRanking(dom.statTopPeople, stats.topPeople, 'Sin personas todavía.');
}

async function saveProfileFromModal() {
  if (currentSession.mode !== 'user') {
    return;
  }

  const profile = getProfile();
  const nick = dom.profileNickInput.value.trim();
  const name = dom.profileNameInput.value.trim();
  const phone = normalizePhoneNumber(dom.profilePhoneInput.value);
  const currency = dom.profileCurrencyInput.value === 'CLP' ? 'CLP' : 'CLP';
  const themePreference = ['system', 'light', 'dark'].includes(dom.profileThemePreferenceInput.value)
    ? dom.profileThemePreferenceInput.value
    : 'system';

  profile.nick = nick;
  profile.name = name;
  profile.phone = phone;
  profile.currency = currency;
  profile.themePreference = themePreference;
  profile.updatedAt = nowIso();

  currentSession.name = nick || name || currentSession.email || 'Usuario';
  saveAuthSession();

  if (themePreference === 'light' || themePreference === 'dark') {
    document.documentElement.dataset.theme = themePreference;
    localStorage.setItem(THEME_KEY, themePreference);
    dom.themeToggle.textContent = themePreference === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }

  saveState();

  if (hasSupabaseClient()) {
    const { error } = await supabaseClient.auth.updateUser({
      data: {
        nick,
        nombre: name,
        phone,
      },
    });

    if (error) {
      showNotice('Perfil guardado localmente', `No se pudo actualizar metadata en Supabase: ${error.message}`);
    }
  }

  await saveCloudStateNow();
  render();
  showToast('Perfil actualizado.');
}

async function saveProfilePreferences() {
  await saveProfileFromModal();
}



function setSyncStatus(status, message = '') {
  cloudSyncStatus = status;

  if (!dom.syncStatusBadge) {
    return;
  }

  const isUser = currentSession.mode === 'user';
  dom.syncStatusBadge.classList.toggle('hidden', !isUser);

  if (!isUser) {
    dom.syncStatusBadge.textContent = 'Local';
    dom.syncStatusBadge.className = 'sync-status-badge hidden';
    return;
  }

  dom.syncStatusBadge.classList.remove('is-saving', 'is-saved', 'is-error', 'is-local');
  dom.syncStatusBadge.classList.add(`is-${status}`);

  if (message) {
    dom.syncStatusBadge.textContent = message;
    return;
  }

  if (status === 'saving') {
    dom.syncStatusBadge.textContent = 'Sincronizando...';
  } else if (status === 'saved') {
    dom.syncStatusBadge.textContent = 'Sincronizado';
  } else if (status === 'error') {
    dom.syncStatusBadge.textContent = 'Guardado local';
  } else {
    dom.syncStatusBadge.textContent = 'Local';
  }
}

function getCloudSavedText() {
  if (!lastCloudSyncAt) {
    return 'Sincronizado';
  }

  return `Sincronizado ${new Date(lastCloudSyncAt).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}



function getPublicProfilePayloadFromMain() {
  if (!currentSession.userId) {
    return null;
  }

  const profile = state?.profile || {};
  const displayName = profile.nick || profile.name || currentSession.name || currentSession.email || 'Usuario';

  return {
    id: currentSession.userId,
    email: currentSession.email || '',
    nick: profile.nick || displayName,
    nombre: profile.name || currentSession.name || displayName,
    telefono: normalizePhoneNumber(profile.phone || ''),
    avatar_data_url: profile.avatarDataUrl || '',
    allow_search: true,
    updated_at: nowIso(),
  };
}

async function savePublicProfileFromMain() {
  if (!hasSupabaseClient() || currentSession.mode !== 'user' || !currentSession.userId || !state) {
    return;
  }

  const payload = getPublicProfilePayloadFromMain();

  if (!payload) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('public_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('No se pudo actualizar public_profiles:', error);
      if (String(error.message || '').toLowerCase().includes('public_profiles')) {
        showNotice('Perfil público no disponible', 'Ejecuta sql/02-supabase-social.sql en Supabase para activar búsqueda y amigos entre usuarios.');
      }
    }
  } catch (error) {
    console.warn('No se pudo actualizar public_profiles:', error);
  }
}


function renderAuthUI() {
  if (!dom.authButton || !dom.authStatusBadge) {
    return;
  }

  const isUser = currentSession.mode === 'user';

  const displayName = isUser ? getProfileDisplayName() : '';
  dom.authStatusBadge.textContent = isUser ? displayName : 'Invitado';
  dom.authStatusBadge.classList.toggle('is-user', isUser);
  dom.authStatusBadge.title = isUser ? 'Abrir perfil' : 'Iniciar sesión';
  dom.authButton.textContent = 'Ingresar';
  dom.authButton.classList.toggle('hidden', isUser);
  setSyncStatus(isUser ? (lastCloudSyncAt ? 'saved' : cloudSyncStatus) : 'local', isUser && lastCloudSyncAt ? getCloudSavedText() : '');

  if (dom.authSessionPanel && dom.authFormsPanel) {
    dom.authSessionPanel.classList.toggle('hidden', !isUser);
    dom.authFormsPanel.classList.toggle('hidden', isUser);

    if (isUser) {
      dom.authSessionTitle.textContent = `Hola, ${displayName}`;
      dom.authSessionDescription.textContent = `Tus cuentas se están sincronizando con Supabase para ${currentSession.email}. ${lastCloudSyncAt ? 'Última sincronización: ' + new Date(lastCloudSyncAt).toLocaleString('es-CL') : ''}`;
      renderProfilePanels();
    }
  }
}



function openReceiptModal() {
  if (getActiveBill().mode === 'quick') {
    showNotice('Modo rápido activo', 'Para agregar desde boleta usa modo Detallada u Hogar.');
    return;
  }

  dom.receiptModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  updateReceiptStatus('Sube una foto clara para comenzar.');
}

function closeReceiptModal() {
  dom.receiptModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function updateReceiptStatus(message) {
  dom.receiptStatus.textContent = message;
}

function clearReceiptReader() {
  receiptSelectedFile = null;
  receiptDetectedItems = [];
  dom.receiptFileInput.value = '';
  dom.receiptPreviewImage.removeAttribute('src');
  dom.receiptPreviewWrap.classList.add('hidden');

  if (dom.receiptRawTextInput) {
    dom.receiptRawTextInput.value = '';
  }

  renderReceiptDetectedItems();
  updateReceiptStatus('Sube una foto clara para comenzar.');
}

function handleReceiptFileChange() {
  const file = dom.receiptFileInput.files?.[0];

  if (!file) {
    clearReceiptReader();
    return;
  }

  receiptSelectedFile = file;

  const url = URL.createObjectURL(file);
  dom.receiptPreviewImage.src = url;
  dom.receiptPreviewWrap.classList.remove('hidden');
  receiptDetectedItems = [];
  if (dom.receiptRawTextInput) {
    dom.receiptRawTextInput.value = '';
  }
  renderReceiptDetectedItems();
  updateReceiptStatus('Imagen cargada. Presiona “Leer boleta”.');
}

function parseMoneyFromReceipt(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return 0;
  }

  const clean = raw
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/[^\d-]/g, '');

  const amount = Number(clean);

  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function cleanReceiptProductName(value) {
  return String(value || '')
    .replace(/^\s*\d+\s*[xX]\s*/g, '')
    .replace(/\b\d+[,.]\d{1,2}\b\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[|_*~]+/g, '')
    .replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ$]+/g, '')
    .trim();
}

function normalizeReceiptLine(line) {
  return String(line || '')
    .replace(/[|]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeReceiptKeyword(line) {
  return String(line || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function shouldIgnoreReceiptLine(line) {
  const normalized = normalizeReceiptKeyword(line);

  if (!normalized || normalized.length < 3) {
    return true;
  }

  const exactSectionWords = [
    'comidas',
    'bebidas',
    'detalle de cuenta',
    'terraza',
  ];

  if (exactSectionWords.includes(normalized.trim())) {
    return true;
  }

  const ignoredWords = [
    'total',
    'sub-total',
    'subtotal',
    'sub total',
    'propina',
    'tips',
    'iva',
    'neto',
    'exento',
    'vuelto',
    'cambio',
    'efectivo',
    'tarjeta',
    'debito',
    'credito',
    'transbank',
    'redcompra',
    'boleta',
    'factura',
    'rut',
    'fecha',
    'hora',
    'folio',
    'caja',
    'mesa',
    'cubiertos',
    'cuenta',
    'garzon',
    'vendedor',
    'terminal',
    'autorizacion',
    'comercio',
    'direccion',
    'telefono',
    'gracias',
    'descuento',
    'medio de pago',
    'monto',
    'pago',
    'atendido',
    'preferencia',
  ];

  return ignoredWords.some((word) => normalized.includes(word));
}

function guessReceiptCategory(name) {
  const normalized = normalizeReceiptKeyword(name);

  if (/(cerveza|pisco|mojito|piscola|ron|vino|trago|shop|sch|kunstmann|austral|escudo|jager|daiquiri|daikiri|tequila|whisky|vodka|royal|calafate)/.test(normalized)) {
    return 'Tragos';
  }

  if (/(bebida|coca|sprite|fanta|jugo|agua mineral|limonada|cafe|te|latte)/.test(normalized)) {
    return 'Bebestibles';
  }

  if (/(postre|helado|torta|kuchen|brownie|dulce)/.test(normalized)) {
    return 'Postres';
  }

  if (/(supermercado|mercado|pan|leche|huevo|arroz|verdura|fruta|detergente)/.test(normalized)) {
    return getActiveBill().mode === 'home' ? 'Supermercado' : 'Comida';
  }

  if (getActiveBill().mode === 'home') {
    return 'Supermercado';
  }

  return 'Comida';
}

function isLikelyReceiptSubtotalLine(name, price, previousItems) {
  const normalized = normalizeReceiptKeyword(name);

  if (!name || shouldIgnoreReceiptLine(name)) {
    return true;
  }

  // Líneas que solo son un monto, sin producto.
  if (/^[\d\s.,$-]+$/.test(name)) {
    return true;
  }

  // En boletas de restaurante suelen aparecer subtotales por sección justo después de varios productos.
  // Si la línea no tiene letras claras o tiene texto de sección, se ignora.
  if (!/[a-záéíóúñ]/i.test(name)) {
    return true;
  }

  // Evitar tomar como producto un subtotal que sea igual a la suma parcial cercana.
  const recentSum = previousItems.slice(-5).reduce((sum, item) => sum + item.price, 0);
  if (recentSum > 0 && Math.abs(recentSum - price) <= 5 && normalized.length <= 16) {
    return true;
  }

  return false;
}

function createReceiptItem(name, price, seen, items) {
  const cleanName = cleanReceiptProductName(name);
  const amount = parseMoneyFromReceipt(price);

  if (!cleanName || amount <= 0) {
    return null;
  }

  if (isLikelyReceiptSubtotalLine(cleanName, amount, items)) {
    return null;
  }

  if (cleanName.length < 3 || /^\d+$/.test(cleanName)) {
    return null;
  }

  const key = `${cleanName.toLowerCase()}-${amount}`;

  if (seen.has(key)) {
    return null;
  }

  seen.add(key);

  return {
    id: createId('receipt'),
    selected: true,
    name: cleanName,
    price: amount,
    category: guessReceiptCategory(cleanName),
  };
}


function isReceiptProductNameLine(line) {
  const cleanLine = cleanReceiptProductName(line);

  if (!cleanLine || shouldIgnoreReceiptLine(cleanLine)) {
    return false;
  }

  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ$]/.test(cleanLine)) {
    return false;
  }

  if (/^\$?\s*-?\d/.test(cleanLine)) {
    return false;
  }

  // Evita encabezados o nombres demasiado genéricos.
  const normalized = normalizeReceiptKeyword(cleanLine);
  const nonProductWords = ['comidas', 'bebidas', 'detalle', 'restaurant', 'restaurante', 'terraza'];

  if (nonProductWords.some((word) => normalized === word || normalized.includes(`${word} de`))) {
    return false;
  }

  return true;
}

function extractReceiptAmounts(line) {
  const matches = String(line || '').match(/-?\d{1,3}(?:[.\s,]\d{3})+|-?\d{4,7}/g) || [];

  return matches
    .map(parseMoneyFromReceipt)
    .filter((amount) => amount > 0);
}

function isReceiptQuantityLine(line) {
  return /^\s*\d+[,.]\d{1,2}\s*$/.test(String(line || ''));
}

function isReceiptQuantityAndAmountLine(line) {
  return /^\s*\d+[,.]\d{1,2}\s+\$?\s*(-?\d{1,3}(?:[.\s,]\d{3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/.test(String(line || ''));
}

function amountFromQuantityAndAmountLine(line) {
  const match = String(line || '').match(/^\s*\d+[,.]\d{1,2}\s+\$?\s*(-?\d{1,3}(?:[.\s,]\d{3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
  return match ? parseMoneyFromReceipt(match[1]) : 0;
}

function addReceiptItemFromParts(items, seen, name, price) {
  const item = createReceiptItem(name, price, seen, items);

  if (item) {
    items.push(item);
    return true;
  }

  return false;
}

function detectSeparatedReceiptColumns(rawLines, items, seen) {
  let index = 0;

  while (index < rawLines.length) {
    const productLines = [];

    // Buscar bloque de nombres de productos.
    while (index < rawLines.length) {
      const line = rawLines[index];

      if (isReceiptProductNameLine(line)) {
        productLines.push(line);
        index += 1;
        continue;
      }

      break;
    }

    if (productLines.length === 0) {
      index += 1;
      continue;
    }

    // Capturar líneas siguientes hasta la próxima sección con texto.
    const numericLines = [];
    let scan = index;

    while (scan < rawLines.length) {
      const line = rawLines[scan];

      if (isReceiptProductNameLine(line)) {
        break;
      }

      if (shouldIgnoreReceiptLine(line) && !extractReceiptAmounts(line).length) {
        break;
      }

      if (extractReceiptAmounts(line).length || isReceiptQuantityLine(line) || isReceiptQuantityAndAmountLine(line)) {
        numericLines.push(line);
      }

      scan += 1;
    }

    // Caso 1: cada línea numérica trae cantidad + monto.
    const quantityAmountLines = numericLines
      .filter(isReceiptQuantityAndAmountLine)
      .map(amountFromQuantityAndAmountLine)
      .filter((amount) => amount > 0);

    if (quantityAmountLines.length >= productLines.length) {
      productLines.forEach((name, productIndex) => {
        addReceiptItemFromParts(items, seen, name, quantityAmountLines[productIndex]);
      });
      index = scan;
      continue;
    }

    // Caso 2: OCR separa nombres, cantidades y montos por columnas.
    const amounts = numericLines
      .flatMap(extractReceiptAmounts)
      .filter((amount) => amount >= 300);

    // Si viene un subtotal al final, normalmente sobra un monto.
    const usableAmounts = amounts.slice(0, productLines.length);

    if (usableAmounts.length >= productLines.length) {
      productLines.forEach((name, productIndex) => {
        addReceiptItemFromParts(items, seen, name, usableAmounts[productIndex]);
      });
      index = scan;
      continue;
    }

    index = Math.max(index + 1, scan);
  }
}

function parseReceiptText(text) {
  const rawLines = String(text || '')
    .split(/\r?\n/)
    .map(normalizeReceiptLine)
    .filter(Boolean);

  const items = [];
  const seen = new Set();

  for (let index = 0; index < rawLines.length; index++) {
    const line = rawLines[index];

    if (shouldIgnoreReceiptLine(line)) {
      continue;
    }

    // Caso A: Producto + cantidad + precio. Ej: VIAN ITALIANA 2.00 8,180
    let match = line.match(/^(.+?)\s+(\d+[,.]\d{1,2})\s+\$?\s*(-?\d{1,3}(?:[.\s,]\d{3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
    if (match) {
      addReceiptItemFromParts(items, seen, match[1], match[3]);
      continue;
    }

    // Caso B: Producto + precio. Ej: Papas fritas 8.250
    match = line.match(/^(.+?)\s+\$?\s*(-?\d{1,3}(?:[.\s,]\d{3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
    if (match) {
      addReceiptItemFromParts(items, seen, match[1], match[2]);
      continue;
    }

    // Caso C: OCR separó producto y números en líneas distintas.
    // Ej:
    // VIAN ITALIANA
    // 2.00 8,180
    const nextLine = rawLines[index + 1] || '';
    const splitMatch = nextLine.match(/^(?:\d+[,.]\d{1,2}\s+)?\$?\s*(-?\d{1,3}(?:[.\s,]\d{3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
    if (splitMatch && isReceiptProductNameLine(line)) {
      const added = addReceiptItemFromParts(items, seen, line, splitMatch[1]);
      if (added) {
        index += 1;
      }
    }
  }

  // Caso D: OCR leyó las columnas completas por separado:
  // nombres primero, cantidades después, montos después.
  detectSeparatedReceiptColumns(rawLines, items, seen);

  return items;
}


function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen.'));
    };

    image.src = url;
  });
}

async function preprocessReceiptImage(file) {
  const image = await loadImageFromFile(file);
  const maxWidth = 1800;
  const scale = Math.min(2.2, Math.max(1, maxWidth / image.width));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    // Contraste fuerte para papel térmico / boleta.
    const contrasted = gray > 170 ? 255 : gray < 95 ? 0 : Math.max(0, Math.min(255, (gray - 95) * 2.2));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }

  context.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || file);
    }, 'image/png', 1);
  });
}

async function processReceiptImage() {
  if (!receiptSelectedFile) {
    showToast('Primero sube una foto de la boleta.');
    return;
  }

  if (typeof Tesseract === 'undefined') {
    showNotice('OCR no disponible', 'No se pudo cargar la librería de lectura. Prueba con internet activo o desde Vercel.');
    return;
  }

  try {
    dom.processReceiptButton.disabled = true;
    updateReceiptStatus('Mejorando imagen para lectura...');

    const processedImage = await preprocessReceiptImage(receiptSelectedFile);

    updateReceiptStatus('Leyendo boleta... Esto puede tardar algunos segundos.');

    const result = await Tesseract.recognize(processedImage, 'spa+eng', {
      logger: (event) => {
        if (event.status === 'recognizing text' && Number.isFinite(event.progress)) {
          updateReceiptStatus(`Leyendo texto... ${Math.round(event.progress * 100)}%`);
        }
      },
      tessedit_pageseg_mode: '6',
      preserve_interword_spaces: '1',
    });

    const text = result?.data?.text || '';

    if (dom.receiptRawTextInput) {
      dom.receiptRawTextInput.value = text.trim();
    }

    receiptDetectedItems = parseReceiptText(text);
    renderReceiptDetectedItems();

    if (receiptDetectedItems.length === 0) {
      updateReceiptStatus('No se detectaron productos claros. Revisa el texto leído, edítalo si hace falta y presiona “Volver a detectar”.');
      return;
    }

    updateReceiptStatus(`Lectura terminada. Revisa y corrige ${receiptDetectedItems.length} productos antes de agregarlos.`);
  } catch (error) {
    console.error(error);
    showNotice('Error al leer boleta', 'No se pudo procesar la imagen. Prueba con otra foto más clara.');
    updateReceiptStatus('No se pudo leer la boleta.');
  } finally {
    dom.processReceiptButton.disabled = false;
  }
}

function reparseReceiptRawText() {
  const text = dom.receiptRawTextInput?.value || '';

  if (!text.trim()) {
    showToast('No hay texto para detectar.');
    return;
  }

  receiptDetectedItems = parseReceiptText(text);
  renderReceiptDetectedItems();

  if (receiptDetectedItems.length === 0) {
    updateReceiptStatus('No se detectaron productos. Puedes editar el texto leído y volver a intentar.');
    return;
  }

  updateReceiptStatus(`Se detectaron ${receiptDetectedItems.length} productos desde el texto.`);
}

function renderReceiptDetectedItems() {
  dom.receiptDetectedBody.innerHTML = '';
  dom.receiptDetectedCount.textContent = `${receiptDetectedItems.length} encontrados`;

  if (receiptDetectedItems.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4">No hay productos detectados todavía.</td>`;
    dom.receiptDetectedBody.appendChild(row);
    return;
  }

  for (const item of receiptDetectedItems) {
    const row = document.createElement('tr');
    row.dataset.itemId = item.id;
    row.innerHTML = `
      <td><input type="checkbox" ${item.selected ? 'checked' : ''} aria-label="Usar producto" /></td>
      <td><input type="text" value="${escapeHtml(item.name)}" aria-label="Producto detectado" /></td>
      <td><input type="number" min="0" step="1" value="${item.price}" aria-label="Monto detectado" /></td>
      <td>
        <select aria-label="Categoría detectada">
          ${CATEGORIES.map((category) => `<option ${category === item.category ? 'selected' : ''}>${category}</option>`).join('')}
        </select>
      </td>
    `;

    const checkbox = row.querySelector('input[type="checkbox"]');
    const nameInput = row.querySelector('input[type="text"]');
    const priceInput = row.querySelector('input[type="number"]');
    const categorySelect = row.querySelector('select');

    checkbox.addEventListener('change', () => {
      item.selected = checkbox.checked;
    });

    nameInput.addEventListener('input', () => {
      item.name = nameInput.value;
    });

    priceInput.addEventListener('input', () => {
      item.price = Number(priceInput.value || 0);
    });

    categorySelect.addEventListener('change', () => {
      item.category = categorySelect.value;
    });

    dom.receiptDetectedBody.appendChild(row);
  }
}

function setAllReceiptItems(selected) {
  receiptDetectedItems = receiptDetectedItems.map((item) => ({ ...item, selected }));
  renderReceiptDetectedItems();
}

function addReceiptItemsToBill() {
  const bill = getActiveBill();

  if (bill.mode === 'quick') {
    showNotice('Modo rápido activo', 'Cambia a modo Detallada u Hogar para agregar productos desde boleta.');
    return;
  }

  const selectedItems = receiptDetectedItems
    .map((item) => ({
      ...item,
      name: String(item.name || '').trim(),
      price: Number(item.price || 0),
    }))
    .filter((item) => item.selected && item.name && item.price > 0);

  if (selectedItems.length === 0) {
    showToast('Selecciona al menos un producto válido.');
    return;
  }

  if (bill.people.length === 0) {
    showNotice('Agrega personas primero', 'Para agregar productos desde boleta necesitas tener personas en la cuenta.');
    return;
  }

  const defaultSplitMode = bill.mode === 'home' ? 'responsibles' : 'participants';
  const defaultConsumers = defaultSplitMode === 'responsibles'
    ? []
    : bill.people.map((person) => ({
        personId: person.id,
        share: 1,
      }));

  for (const item of selectedItems) {
    bill.products.push({
      id: createId('product'),
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      category: CATEGORIES.includes(item.category) ? item.category : (bill.mode === 'home' ? 'Supermercado' : 'Comida'),
      splitMode: defaultSplitMode,
      dueDate: '',
      paidById: '',
      recurring: false,
      consumers: defaultConsumers.map((consumer) => ({ ...consumer })),
    });
  }

  persistAndRender();
  closeReceiptModal();
  clearReceiptReader();
  showToast(`${selectedItems.length} productos agregados desde boleta.`);
}



function handleAuthBadgeClick() {
  if (currentSession.mode === 'user') {
    window.location.href = 'perfil.html';
    return;
  }

  openAuthModal();
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

  if (!hasSupabaseClient()) {
    showNotice('Supabase no disponible', 'No se pudo cargar la conexión a Supabase.');
    return;
  }

  const name = dom.registerNameInput.value.trim();
  const email = normalizeEmail(dom.registerEmailInput.value);
  const password = dom.registerPasswordInput.value;
  const guestState = normalizeState(state);

  if (!name) {
    showToast('Ingresa tu nombre.');
    return;
  }

  if (!email) {
    showToast('Ingresa tu correo.');
    return;
  }

  if (!password || password.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: name,
      },
    },
  });

  if (error) {
    showNotice('No se pudo crear la cuenta', error.message);
    return;
  }

  const sessionUser = data?.session?.user || data?.user;

  if (!data?.session) {
    showNotice('Cuenta creada', 'Supabase creó el usuario, pero requiere confirmación de correo antes de iniciar sesión.');
    return;
  }

  setUserSession(sessionUser);
  saveAuthSession();

  if (dom.importGuestDataCheckbox.checked) {
    state = guestState;
  } else {
    state = normalizeState(null);
  }

  state.profile = makeDefaultProfile({
    nick: name,
    name,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  migrateEmptyDefaultPeople();
  localStorage.setItem(activeStorageKey, JSON.stringify(state));
  await saveCloudStateNow();
  await savePublicProfileFromMain();
  render();
  closeAuthModal();
  showToast('Cuenta creada y sincronizada.');
}

async function loginLocalUser(event) {
  event.preventDefault();

  if (!hasSupabaseClient()) {
    showNotice('Supabase no disponible', 'No se pudo cargar la conexión a Supabase.');
    return;
  }

  const email = normalizeEmail(dom.loginEmailInput.value);
  const password = dom.loginPasswordInput.value;

  if (!email || !password) {
    showToast('Ingresa correo y contraseña.');
    return;
  }

  saveState();

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showNotice('No se pudo iniciar sesión', error.message);
    return;
  }

  setUserSession(data.user);
  saveAuthSession();

  const loaded = await loadCloudState();
  await savePublicProfileFromMain();

  if (!loaded) {
    loadState();
  }

  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Sesión iniciada con Supabase.');
}

function switchToGuestMode() {
  saveState();
  supabaseClient?.auth?.signOut?.();
  clearAuthSession();
  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Modo invitado activo.');
}

async function logoutLocalUser() {
  saveState();

  if (hasSupabaseClient()) {
    await saveCloudStateNow();
    await supabaseClient.auth.signOut();
  }

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
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
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


function makeDefaultProfile(input = {}) {
  const sessionName = currentSession?.name && currentSession.name !== 'Usuario'
    ? currentSession.name
    : '';

  return {
    nick: String(input.nick || input.displayName || sessionName || '').trim(),
    name: String(input.name || sessionName || '').trim(),
    phone: normalizePhoneNumber(input.phone || ''),
    avatarDataUrl: String(input.avatarDataUrl || input.avatar || '').startsWith('data:image/') ? String(input.avatarDataUrl || input.avatar) : '',
    currency: input.currency === 'CLP' ? 'CLP' : 'CLP',
    themePreference: ['system', 'light', 'dark'].includes(input.themePreference) ? input.themePreference : 'system',
    createdAt: input.createdAt || nowIso(),
    updatedAt: input.updatedAt || nowIso(),
  };
}

function getProfile() {
  state.profile = makeDefaultProfile(state.profile || {});
  return state.profile;
}

function getProfileDisplayName() {
  const profile = getProfile();
  return profile.nick || profile.name || currentSession.name || currentSession.email || 'Usuario';
}

function getInitials(value) {
  const parts = String(value || 'CC')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'CC';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}



function normalizeFriends(input = []) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((friend) => ({
      id: friend.id || createId('friend'),
      name: String(friend.name || '').trim(),
      phone: normalizePhoneNumber(friend.phone || ''),
      email: String(friend.email || '').trim(),
      notes: String(friend.notes || '').trim(),
      avatarDataUrl: String(friend.avatarDataUrl || '').startsWith('data:image/') ? String(friend.avatarDataUrl) : '',
      createdAt: friend.createdAt || nowIso(),
      updatedAt: friend.updatedAt || friend.createdAt || nowIso(),
    }))
    .filter((friend) => friend.name);
}

function getFriends() {
  state.friends = normalizeFriends(state.friends || []);
  return state.friends;
}


function normalizeRecurringGroups(input = []) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((group) => ({
      id: group.id || createId('recurring'),
      name: String(group.name || 'Cuenta recurrente').trim() || 'Cuenta recurrente',
      category: String(group.category || 'Hogar').trim() || 'Hogar',
      frequency: group.frequency === 'monthly' ? 'monthly' : 'monthly',
      billIds: Array.isArray(group.billIds) ? [...new Set(group.billIds.filter(Boolean))] : [],
      members: Array.isArray(group.members)
        ? group.members.map((member) => ({
            name: String(member.name || '').trim(),
            phone: normalizePhoneNumber(member.phone || ''),
            email: normalizeEmail(member.email || ''),
            userId: String(member.userId || ''),
          })).filter((member) => member.name || member.email || member.userId)
        : [],
      createdAt: group.createdAt || nowIso(),
      updatedAt: group.updatedAt || group.createdAt || nowIso(),
    }))
    .filter((group) => group.name);
}

function createStatePayload(bills, activeBillId, input = {}) {
  return {
    bills,
    activeBillId,
    quickProducts: normalizeQuickProducts(input?.quickProducts),
    profile: makeDefaultProfile(input?.profile || {}),
    friends: normalizeFriends(input?.friends || []),
    recurringGroups: normalizeRecurringGroups(input?.recurringGroups || []),
  };
}

function normalizeState(input) {
  if (!input || !Array.isArray(input.bills)) {
    const bill = makeDefaultBill();
    return createStatePayload([bill], bill.id, input);
  }

  const bills = input.bills.map((bill) => {
    const people = Array.isArray(bill.people)
      ? bill.people.map((person) => ({
          id: person.id || createId('person'),
          name: String(person.name || 'Persona'),
          phone: normalizePhoneNumber(person.phone || ''),
          email: normalizeEmail(person.email || ''),
          userId: String(person.userId || person.profileId || ''),
          previousDebt: Math.max(0, Number(person.previousDebt || 0)),
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
      recurringGroupId: String(bill.recurringGroupId || ''),
      recurringSequence: Math.max(1, Number(bill.recurringSequence || 1)),
      previousBillId: String(bill.previousBillId || ''),
      sharedAccountId: String(bill.sharedAccountId || ''),
      sharedRole: String(bill.sharedRole || ''),
      sharedOwnerId: String(bill.sharedOwnerId || ''),
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
    return createStatePayload([bill], bill.id, input);
  }

  const activeBillId = bills.some((bill) => bill.id === input.activeBillId)
    ? input.activeBillId
    : bills[0].id;

  return createStatePayload(bills, activeBillId, input);
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
  try {
    localStorage.setItem(activeStorageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('No se pudo guardar localmente:', error);
    showNotice('No se pudo guardar en este navegador', 'La cuenta sigue abierta, pero el navegador no permitió guardar localmente. Si tienes sesión iniciada, intentaré sincronizarla igual; también puedes exportar respaldo.');
  }

  scheduleCloudSave();
  scheduleSharedActiveBillSave();
}

function getActiveBill() {
  if (!state || !Array.isArray(state.bills) || state.bills.length === 0) {
    const bill = makeDefaultBill();
    state = normalizeState({ bills: [bill], activeBillId: bill.id });
    return bill;
  }

  const activeBill = state.bills.find((bill) => bill.id === state.activeBillId) || state.bills[0];

  if (!state.activeBillId || !state.bills.some((bill) => bill.id === state.activeBillId)) {
    state.activeBillId = activeBill.id;
  }

  return activeBill;
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

  for (const person of bill.people) {
    const previousDebt = Math.max(0, Number(person.previousDebt || 0));

    if (previousDebt > 0) {
      baseTotals[person.id] = (baseTotals[person.id] || 0) + previousDebt;

      if (personDetails[person.id]) {
        personDetails[person.id].items.push({
          productId: 'previous_debt',
          productName: 'Deuda anterior',
          unitPrice: previousDebt,
          quantity: 1,
          productTotal: previousDebt,
          share: 1,
          totalShares: 1,
          amount: previousDebt,
          category: 'Otros',
          splitMode: 'carryover',
        });
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



function getExperienceMode() {
  return localStorage.getItem(EXPERIENCE_MODE_KEY) === 'advanced' ? 'advanced' : 'simple';
}

function setExperienceMode(mode) {
  const selectedMode = mode === 'advanced' ? 'advanced' : 'simple';
  localStorage.setItem(EXPERIENCE_MODE_KEY, selectedMode);
  document.body.classList.toggle('simple-mode', selectedMode === 'simple');
  document.body.classList.toggle('advanced-mode', selectedMode === 'advanced');

  if (dom.simpleModeButton && dom.advancedModeButton) {
    dom.simpleModeButton.classList.toggle('is-active', selectedMode === 'simple');
    dom.advancedModeButton.classList.toggle('is-active', selectedMode === 'advanced');
  }

  try {
    renderGuidedExperience();
  } catch (error) {
    console.warn('No se pudo renderizar la experiencia guiada:', error);
  }
}

function initExperienceMode() {
  setExperienceMode(getExperienceMode());
}


function normalizeAppSection(section) {
  const allowed = new Set(['home', 'people', 'expenses', 'summary', 'payments', 'history', 'recurring', 'shared', 'settings']);
  const aliases = {
    products: 'expenses',
    gastos: 'expenses',
    review: 'summary',
    share: 'payments',
    hogar: 'recurring',
    cuenta: 'settings',
  };
  const value = aliases[section] || section || 'home';
  return allowed.has(value) ? value : 'home';
}

function getStoredAppSection() {
  try {
    return normalizeAppSection(localStorage.getItem(APP_SECTION_KEY));
  } catch {
    return 'home';
  }
}

function setAppSection(section, options = {}) {
  const nextSection = normalizeAppSection(section);

  if (!dom.appSectionPanels || dom.appSectionPanels.length === 0) {
    return;
  }

  dom.appSectionPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.appSectionPanel === nextSection);
  });

  dom.sectionNavButtons?.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.appSection === nextSection);
  });

  try {
    localStorage.setItem(APP_SECTION_KEY, nextSection);
  } catch {
    // Si el navegador bloquea localStorage, la navegación sigue funcionando en memoria visual.
  }

  if (options.scroll !== false) {
    const panel = document.querySelector(`[data-app-section-panel="${nextSection}"]`);
    panel?.scrollIntoView({ behavior: options.instant ? 'auto' : 'smooth', block: 'start' });
  }
}

function revealSectionForElement(element) {
  const panel = element?.closest?.('[data-app-section-panel]');
  if (!panel) return;
  setAppSection(panel.dataset.appSectionPanel, { scroll: false });
}

function initAppSections() {
  setAppSection(getStoredAppSection(), { scroll: false, instant: true });
}

function scrollToGuideTarget(element) {
  if (!element) return;

  revealSectionForElement(element);

  setTimeout(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof element.focus === 'function') {
      element.focus();
    }
  }, 80);
}

function getGuidedState() {
  const bill = getActiveBill() || makeDefaultBill();
  const safeBill = {
    ...bill,
    people: Array.isArray(bill.people) ? bill.people : [],
    products: Array.isArray(bill.products) ? bill.products : [],
  };
  const calculation = calculateBill(safeBill);
  const hasPeople = safeBill.people.length > 0;
  const hasProducts = safeBill.mode === 'quick'
    ? Number(safeBill.quickTotal || 0) > 0
    : safeBill.products.length > 0;
  const hasAmounts = calculation.grandTotal > 0;

  return { bill: safeBill, calculation, hasPeople, hasProducts, hasAmounts };
}

function getSmartActionCopy() {
  const { bill, hasPeople, hasProducts, hasAmounts } = getGuidedState();

  if (!hasPeople) {
    return {
      title: 'Agrega personas',
      help: 'Empieza agregando quienes participarán en esta cuenta. También puedes usar tus amigos frecuentes.',
      button: 'Agregar personas',
      step: 'people',
    };
  }

  if (!bill.payerId) {
    return {
      title: 'Elige pagador principal',
      help: 'En Personas selecciona quién pagó o quién recibirá las transferencias.',
      button: 'Elegir pagador',
      step: 'people',
    };
  }

  if (bill.mode === 'quick' && !hasProducts) {
    return {
      title: 'Ingresa el monto total',
      help: 'En modo rápido solo necesitas el total de la cuenta. La app lo divide entre las personas agregadas.',
      button: 'Ingresar total',
      step: 'products',
    };
  }

  if (bill.mode !== 'quick' && !hasProducts) {
    return {
      title: bill.mode === 'home' ? 'Agrega el primer gasto' : 'Agrega el primer producto',
      help: bill.mode === 'home'
        ? 'Registra gastos del hogar como luz, agua, internet, supermercado o streaming.'
        : 'Puedes escribir productos manualmente o usar la opción de escanear boleta.',
      button: bill.mode === 'home' ? 'Agregar gasto' : 'Agregar producto',
      step: 'products',
    };
  }

  if (hasAmounts) {
    return {
      title: 'Revisa y comparte',
      help: 'Ya tienes montos calculados. Revisa quién debe pagar y comparte el resumen por WhatsApp o imagen.',
      button: 'Compartir cuenta',
      step: 'share',
    };
  }

  return {
    title: 'Revisa la cuenta',
    help: 'Verifica personas, productos y forma de división antes de compartir.',
    button: 'Revisar cuenta',
    step: 'review',
  };
}

function updateStepPill(element, state) {
  if (!element) return;
  element.classList.remove('is-current', 'is-done');
  if (state === 'current') element.classList.add('is-current');
  if (state === 'done') element.classList.add('is-done');
}

function renderGuidedExperience() {
  if (!dom.guidedNextTitle) {
    return;
  }

  if (!state || !Array.isArray(state.bills) || state.bills.length === 0) {
    return;
  }

  const { hasPeople, hasProducts, hasAmounts } = getGuidedState();
  const copy = getSmartActionCopy();

  dom.guidedNextTitle.textContent = copy.title;
  dom.guidedNextHelp.textContent = copy.help;
  dom.smartActionButton.textContent = copy.button;

  updateStepPill(dom.stepPeople, hasPeople ? 'done' : 'current');
  updateStepPill(dom.stepProducts, hasProducts ? 'done' : (hasPeople ? 'current' : ''));
  updateStepPill(dom.stepReview, hasAmounts ? 'done' : (hasPeople && hasProducts ? 'current' : ''));
  updateStepPill(dom.stepShare, copy.step === 'share' ? 'current' : '');

  const mode = getExperienceMode();
  dom.simpleModeButton?.classList.toggle('is-active', mode === 'simple');
  dom.advancedModeButton?.classList.toggle('is-active', mode === 'advanced');
}

function getGuidedBillName(mode) {
  const nextNumber = state?.bills?.length ? state.bills.length + 1 : 1;

  if (mode === 'home') return `Cuentas del hogar ${getCurrentMonthValue()}`;
  if (mode === 'quick') return `Cuenta rápida ${nextNumber}`;
  return `Salida ${nextNumber}`;
}

function applyBillModePreset(bill, mode, customName = '') {
  const safeMode = ['detailed', 'home', 'quick'].includes(mode) ? mode : 'detailed';
  bill.mode = safeMode;
  const cleanName = String(customName || '').trim();
  bill.name = cleanName || getGuidedBillName(safeMode);

  if (safeMode === 'home') {
    bill.tipPercent = 0;
    bill.homeMonth = bill.homeMonth || getCurrentMonthValue();
  }

  if (safeMode !== 'home' && !Number.isFinite(Number(bill.tipPercent))) {
    bill.tipPercent = 10;
  }
}

function openInitialAccountSetup(message = 'Lista creada. Agrega personas y define el pagador principal.') {
  accountSettingsPinnedOpenBillId = '';
  setAppSection('people', { scroll: false });

  requestAnimationFrame(() => {
    const bill = getActiveBill();
    const target = bill.people.length > 0 ? dom.payerSelect : dom.personNameInput;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof target?.focus === 'function') {
      target.focus();
    }
  });

  showToast(message);
}

function askGuidedBillName(mode) {
  const defaultName = getGuidedBillName(mode);
  const response = prompt('¿Qué nombre quieres darle a esta lista?', defaultName);

  if (response === null) {
    return null;
  }

  const cleanName = response.trim();
  return cleanName || defaultName;
}

function createGuidedBill(mode) {
  const listName = askGuidedBillName(mode);

  if (!listName) {
    return;
  }

  const bill = makeDefaultBill();
  applyBillModePreset(bill, mode, listName);

  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  editingProductId = null;
  accountSettingsPinnedOpenBillId = '';
  saveState();
  render();
  openInitialAccountSetup(
    bill.mode === 'home'
      ? 'Lista creada. Agrega personas y elige pagador principal en Personas.'
      : 'Lista creada. Agrega personas, elige pagador principal y luego revisa propina en Gastos.'
  );
}

function applyGuidedMode(mode) {
  createGuidedBill(mode);
}

function handleSmartAction() {
  const { bill, hasPeople, hasProducts } = getGuidedState();

  if (!hasPeople) {
    scrollToGuideTarget(dom.personNameInput);
    return;
  }

  if (!bill.payerId) {
    scrollToGuideTarget(dom.payerSelect);
    return;
  }

  if (bill.mode === 'quick' && !hasProducts) {
    scrollToGuideTarget(dom.quickTotalInput);
    return;
  }

  if (bill.mode !== 'quick' && !hasProducts) {
    scrollToGuideTarget(dom.productNameInput);
    return;
  }

  setAppSection('payments', { scroll: false });
  openShareModal();
}

function focusManualProductForm() {
  if (getActiveBill().mode === 'quick') {
    showToast('Cambia a Detallada u Hogar para agregar productos.');
    return;
  }

  scrollToGuideTarget(dom.productNameInput);
}

function showQuickProductsArea() {
  if (getActiveBill().mode === 'quick') {
    showToast('Los productos rápidos se usan en modo Detallada u Hogar.');
    return;
  }

  revealSectionForElement(dom.quickProductsList);
  dom.quickProductsList?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


function getRecurringGroups() {
  state.recurringGroups = normalizeRecurringGroups(state.recurringGroups || []);
  return state.recurringGroups;
}

function getPersonStableKey(person = {}) {
  if (person.userId) return `user:${person.userId}`;
  if (person.email) return `email:${normalizeEmail(person.email)}`;
  if (person.phone) return `phone:${normalizePhoneNumber(person.phone)}`;
  return `name:${String(person.name || '').trim().toLowerCase()}`;
}

function getRecurringGroup(groupId) {
  return getRecurringGroups().find((group) => group.id === groupId) || null;
}

function getGroupBills(group) {
  if (!group) return [];
  const ids = new Set(group.billIds || []);
  return state.bills
    .filter((bill) => bill.recurringGroupId === group.id || ids.has(bill.id))
    .sort((a, b) => String(a.homeMonth || '').localeCompare(String(b.homeMonth || '')) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}

function getLatestGroupBill(group) {
  const bills = getGroupBills(group);
  return bills[bills.length - 1] || null;
}

function getGroupPendingFromLatest(group) {
  const latestBill = getLatestGroupBill(group);
  const pending = new Map();

  if (!latestBill) {
    return pending;
  }

  const calculation = calculateBill(latestBill);

  for (const person of latestBill.people || []) {
    if (!person.paid) {
      const amount = calculation.finalTotals[person.id] || 0;
      if (amount > 0) {
        pending.set(getPersonStableKey(person), {
          name: person.name,
          amount,
          person,
        });
      }
    }
  }

  return pending;
}

function getActiveRecurringGroup() {
  const bill = getActiveBill();
  return bill.recurringGroupId ? getRecurringGroup(bill.recurringGroupId) : null;
}

function billHasAmounts(bill) {
  if (!bill) return false;

  if (bill.mode === 'quick') {
    return Number(bill.quickTotal || 0) > 0;
  }

  const hasProductAmount = (bill.products || []).some((product) =>
    Number(product.unitPrice || 0) * Number(product.quantity || 0) > 0
  );

  const hasPreviousDebt = (bill.people || []).some((person) => Number(person.previousDebt || 0) > 0);

  return hasProductAmount || hasPreviousDebt;
}

function groupHasMonth(group, month, excludedBillId = '') {
  if (!group || !month) return false;
  return getGroupBills(group).some((bill) => bill.id !== excludedBillId && bill.homeMonth === month);
}

function createRecurringGroupFromActiveBill() {
  const bill = getActiveBill();

  if (!bill.people.length) {
    showNotice('Faltan participantes', 'Agrega primero las personas que participan en esta cuenta recurrente.');
    return;
  }

  if (!billHasAmounts(bill)) {
    const continueEmpty = confirm('Esta cuenta no tiene gastos ni deudas. ¿Quieres crear la carpeta recurrente de todas formas?');
    if (!continueEmpty) return;
  }

  const suggestedName = bill.name && bill.name !== 'Nueva cuenta' ? bill.name : 'Streaming';
  const name = prompt('Nombre de la carpeta recurrente:', suggestedName);

  if (name === null) return;

  const cleanName = name.trim();

  if (!cleanName) {
    showToast('El nombre no puede quedar vacío.');
    return;
  }

  const groups = getRecurringGroups();
  const duplicateGroup = groups.find((item) => item.id !== bill.recurringGroupId && item.name.toLowerCase() === cleanName.toLowerCase());

  if (duplicateGroup) {
    showNotice('Carpeta ya existente', `Ya existe una carpeta recurrente llamada "${duplicateGroup.name}". Ábrela desde Hogar / Recurrentes o usa otro nombre.`);
    return;
  }

  let group = bill.recurringGroupId ? getRecurringGroup(bill.recurringGroupId) : null;

  if (!group) {
    group = {
      id: createId('recurring'),
      name: cleanName,
      category: 'Hogar',
      frequency: 'monthly',
      billIds: [],
      members: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    groups.unshift(group);
  } else {
    group.name = cleanName;
    group.updatedAt = nowIso();
  }

  bill.mode = 'home';
  bill.tipPercent = 0;
  bill.homeMonth = bill.homeMonth || getCurrentMonthValue();
  bill.recurringGroupId = group.id;
  bill.recurringSequence = Math.max(1, Number(bill.recurringSequence || 1));

  if (!group.billIds.includes(bill.id)) {
    group.billIds.push(bill.id);
  }

  group.members = bill.people.map((person) => ({
    name: person.name,
    phone: normalizePhoneNumber(person.phone || ''),
    email: normalizeEmail(person.email || ''),
    userId: person.userId || '',
  }));

  persistAndRender();
  showToast(`Carpeta "${cleanName}" creada.`);
}

function createNextRecurringMonthFromActive() {
  const bill = getActiveBill();
  let group = bill.recurringGroupId ? getRecurringGroup(bill.recurringGroupId) : null;

  if (!group) {
    createRecurringGroupFromActiveBill();
    group = getActiveRecurringGroup();
  }

  if (!group) {
    return;
  }

  const latestBill = getLatestGroupBill(group) || bill;

  if (!latestBill.people.length) {
    showNotice('Faltan participantes', 'Agrega participantes antes de crear el siguiente mes.');
    return;
  }

  const pendingFromLatest = getGroupPendingFromLatest(group);
  const pendingTotal = [...pendingFromLatest.values()].reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const nextMonth = getNextMonthValue(latestBill.homeMonth || getCurrentMonthValue());

  const existingMonth = getGroupBills(group).find((item) => item.homeMonth === nextMonth);
  if (existingMonth) {
    state.activeBillId = existingMonth.id;
    saveState();
    render();
    showNotice('Mes ya creado', `${group.name} - ${nextMonth} ya existe. Lo abrí para evitar duplicarlo.`);
    return;
  }

  const recurringProducts = (latestBill.products || []).filter((product) => product.recurring);
  const copyLabel = recurringProducts.length
    ? `Se copiarán ${recurringProducts.length} gasto${recurringProducts.length === 1 ? '' : 's'} marcado${recurringProducts.length === 1 ? '' : 's'} como recurrente${recurringProducts.length === 1 ? '' : 's'}.`
    : 'No hay gastos marcados como recurrentes; se copiarán todos los gastos del último mes.';

  const confirmed = confirm(
    `Crear ${group.name} - ${nextMonth}?\n\n` +
    `${pendingTotal > 0 ? `Se arrastrará deuda pendiente por ${formatCurrency(pendingTotal)}.` : 'No hay deuda pendiente para arrastrar.'}\n` +
    copyLabel
  );

  if (!confirmed) {
    return;
  }

  const createdAt = nowIso();
  const personMap = new Map();

  const newPeople = (latestBill.people || []).map((person) => {
    const newId = createId('person');
    const key = getPersonStableKey(person);
    const pending = pendingFromLatest.get(key);
    personMap.set(person.id, newId);

    return {
      ...person,
      id: newId,
      paid: false,
      previousDebt: pending ? Math.round(pending.amount) : 0,
    };
  });

  const productsToClone = recurringProducts.length ? recurringProducts : (latestBill.products || []);

  const newBill = {
    ...latestBill,
    id: createId('bill'),
    name: `${group.name} - ${nextMonth}`,
    mode: 'home',
    homeMonth: nextMonth,
    payerId: latestBill.payerId ? personMap.get(latestBill.payerId) || '' : '',
    tipPercent: 0,
    archived: false,
    recurringGroupId: group.id,
    recurringSequence: Math.max(1, Number(latestBill.recurringSequence || 1)) + 1,
    previousBillId: latestBill.id,
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
    createdAt,
    updatedAt: createdAt,
    people: newPeople,
    products: productsToClone.map((product) => {
      const dueDay = product.dueDate ? product.dueDate.slice(8, 10) : '';
      const newDueDate = dueDay ? `${nextMonth}-${dueDay}` : '';
      return {
        ...product,
        id: createId('product'),
        dueDate: newDueDate,
        recurring: true,
        consumers: product.consumers
          .filter((consumer) => personMap.has(consumer.personId))
          .map((consumer) => ({ personId: personMap.get(consumer.personId), share: consumer.share })),
      };
    }),
  };

  group.billIds = [...new Set([...(group.billIds || []), latestBill.id, newBill.id])];
  group.members = newBill.people.map((person) => ({
    name: person.name,
    phone: normalizePhoneNumber(person.phone || ''),
    email: normalizeEmail(person.email || ''),
    userId: person.userId || '',
  }));
  group.updatedAt = nowIso();

  state.bills.unshift(newBill);
  state.activeBillId = newBill.id;
  editingProductId = null;
  saveState();
  render();
  showToast('Siguiente mes creado con deudas acumuladas.');
}

function renderRecurringGroups() {
  if (!dom.recurringGroupsList) return;

  const groups = getRecurringGroups();
  dom.recurringGroupsList.innerHTML = '';

  if (!groups.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = 'Aún no hay carpetas recurrentes.';
    dom.recurringGroupsList.appendChild(empty);
    return;
  }

  for (const group of groups) {
    const bills = getGroupBills(group);
    const latestBill = getLatestGroupBill(group);
    const pending = getGroupPendingFromLatest(group);
    const pendingTotal = [...pending.values()].reduce((sum, item) => sum + item.amount, 0);
    const button = document.createElement('button');
    button.className = `recurring-group-item ${latestBill?.id === state.activeBillId ? 'active' : ''}`;
    button.type = 'button';
    button.innerHTML = `
      <div>
        <strong>${escapeHtml(group.name)}</strong>
        <span>${bills.length} mes${bills.length === 1 ? '' : 'es'} · ${latestBill?.homeMonth || 'Sin mes'}</span>
        <small>${pendingTotal > 0 ? `Pendiente acumulado ${formatCurrency(pendingTotal)}` : 'Sin deuda acumulada'}</small>
      </div>
      <span class="bill-count">${bills.length}</span>
    `;

    button.addEventListener('click', () => {
      const target = latestBill || bills[0];
      if (!target) return;
      state.activeBillId = target.id;
      accountSettingsPinnedOpenBillId = '';
      editingProductId = null;
      saveState();
      render();
    });

    dom.recurringGroupsList.appendChild(button);
  }
}

function getRecurringBillStats(bill) {
  const calculation = calculateBill(bill);
  const unpaidPeople = (bill.people || []).filter((person) => !person.paid);
  const paidPeople = (bill.people || []).filter((person) => person.paid);
  const carryover = (bill.people || []).reduce((sum, person) => sum + Math.max(0, Number(person.previousDebt || 0)), 0);
  const pendingPeople = unpaidPeople
    .map((person) => ({
      person,
      amount: Math.round(calculation.finalTotals[person.id] || 0),
      previousDebt: Math.max(0, Number(person.previousDebt || 0)),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount || a.person.name.localeCompare(b.person.name));

  return {
    calculation,
    carryover,
    pendingPeople,
    paidPeople,
    unpaidPeople,
    pendingTotal: Math.round(calculation.pendingTotal || 0),
    paidTotal: Math.round(calculation.paidTotal || 0),
    grandTotal: Math.round(calculation.grandTotal || 0),
    isPaid: calculation.isPaid,
  };
}

function getRecurringDebtSnapshot(group) {
  const latestBill = getLatestGroupBill(group);

  if (!latestBill) {
    return [];
  }

  return getRecurringBillStats(latestBill).pendingPeople.map((item) => ({
    key: getPersonStableKey(item.person),
    name: item.person.name,
    amount: item.amount,
    previousDebt: item.previousDebt,
    currentAmount: Math.max(0, item.amount - item.previousDebt),
    personId: item.person.id,
    billId: latestBill.id,
  }));
}

function openRecurringBill(billId) {
  const target = state.bills.find((item) => item.id === billId);

  if (!target) {
    showToast('No se encontró ese mes.');
    return;
  }

  state.activeBillId = target.id;
  accountSettingsPinnedOpenBillId = '';
  editingProductId = null;
  saveState();
  render();
}

function setRecurringPersonPaid(personId, paid) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) return;

  person.paid = Boolean(paid);
  persistAndRender();
  showToast(`${person.name} quedó como ${person.paid ? 'pagado' : 'pendiente'}.`);
}

function renderRecurringCurrentPeople(bill) {
  if (!dom.recurringCurrentPeopleList) return;

  const stats = getRecurringBillStats(bill);
  dom.recurringCurrentPeopleList.innerHTML = '';

  if (!bill.people.length) {
    dom.recurringCurrentPeopleList.appendChild(emptyMessage('Agrega participantes para controlar pagos mensuales.'));
    return;
  }

  for (const person of bill.people) {
    const amount = Math.round(stats.calculation.finalTotals[person.id] || 0);
    const previousDebt = Math.max(0, Number(person.previousDebt || 0));
    const row = document.createElement('div');
    row.className = `recurring-payment-row ${person.paid ? 'is-paid' : 'is-pending'}`;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(person.name)}</strong>
        <span>${person.paid ? 'Pagado' : 'Pendiente'} · ${formatCurrency(amount)}${previousDebt > 0 ? ` · incluye arrastre ${formatCurrency(previousDebt)}` : ''}</span>
      </div>
      <button class="btn btn-light btn-small" type="button">${person.paid ? 'Marcar pendiente' : 'Marcar pagado'}</button>
    `;

    row.querySelector('button').addEventListener('click', () => {
      setRecurringPersonPaid(person.id, !person.paid);
    });

    dom.recurringCurrentPeopleList.appendChild(row);
  }
}

function renderRecurringDebtSnapshot(group) {
  if (!dom.recurringDebtList) return;

  const debts = getRecurringDebtSnapshot(group);
  dom.recurringDebtList.innerHTML = '';

  if (!debts.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text';
    empty.textContent = 'No hay deuda vigente acumulada.';
    dom.recurringDebtList.appendChild(empty);
    return;
  }

  for (const debt of debts) {
    const row = document.createElement('div');
    row.className = 'recurring-debt-row';
    row.innerHTML = `
      <div>
        <span>${escapeHtml(debt.name)}</span>
        <small>${debt.previousDebt > 0 ? `Arrastre ${formatCurrency(debt.previousDebt)} + mes actual ${formatCurrency(debt.currentAmount)}` : 'Solo mes actual pendiente'}</small>
      </div>
      <strong>${formatCurrency(debt.amount)}</strong>
    `;
    dom.recurringDebtList.appendChild(row);
  }
}

function renderRecurringMonthHistory(group) {
  if (!dom.recurringMonthHistoryList) return;

  const bills = getGroupBills(group);
  dom.recurringMonthHistoryList.innerHTML = '';

  if (!bills.length) {
    dom.recurringMonthHistoryList.appendChild(emptyMessage('Esta carpeta todavía no tiene meses conectados.'));
    return;
  }

  for (const item of [...bills].reverse()) {
    const stats = getRecurringBillStats(item);
    const row = document.createElement('button');
    row.className = `recurring-month-row ${item.id === state.activeBillId ? 'active' : ''}`;
    row.type = 'button';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.homeMonth || 'Sin mes')}</strong>
        <span>${escapeHtml(item.name)} · ${stats.isPaid ? 'Pagado' : 'Pendiente'}</span>
      </div>
      <div>
        <strong>${formatCurrency(stats.grandTotal)}</strong>
        <small>${stats.pendingTotal > 0 ? `Pendiente ${formatCurrency(stats.pendingTotal)}` : 'Sin pendiente'}</small>
      </div>
    `;

    row.addEventListener('click', () => openRecurringBill(item.id));
    dom.recurringMonthHistoryList.appendChild(row);
  }
}

function renderRecurringDashboard() {
  if (!dom.recurringDashboardCard) return;

  const bill = getActiveBill();
  const group = getActiveRecurringGroup();
  const show = Boolean(group && bill.mode === 'home');
  dom.recurringDashboardCard.classList.toggle('hidden', !show);

  if (!show) return;

  const bills = getGroupBills(group);
  const stats = getRecurringBillStats(bill);
  const latestBill = getLatestGroupBill(group) || bill;
  const latestStats = getRecurringBillStats(latestBill);
  const activeMonthLabel = bill.homeMonth || '-';

  dom.recurringDashboardTitle.textContent = group.name;
  dom.recurringDashboardHelp.textContent = `Esta carpeta conecta ${bills.length} mes${bills.length === 1 ? '' : 'es'} de ${group.name}. Usa el historial para abrir meses anteriores y marca pagos para que el siguiente mes arrastre solo lo pendiente.`;
  dom.recurringCurrentMonthOutput.textContent = activeMonthLabel;
  dom.recurringMonthsOutput.textContent = bills.length;
  dom.recurringCarryoverOutput.textContent = formatCurrency(stats.carryover);
  if (dom.recurringPendingOutput) dom.recurringPendingOutput.textContent = formatCurrency(latestStats.pendingTotal);
  if (dom.recurringActiveMonthTitle) dom.recurringActiveMonthTitle.textContent = activeMonthLabel;
  if (dom.recurringActiveMonthStatus) {
    dom.recurringActiveMonthStatus.textContent = stats.isPaid
      ? `Mes pagado · ${formatCurrency(stats.grandTotal)}`
      : `Pendiente ${formatCurrency(stats.pendingTotal)} de ${formatCurrency(stats.grandTotal)}`;
  }

  renderRecurringCurrentPeople(bill);
  renderRecurringDebtSnapshot(group);
  renderRecurringMonthHistory(group);
}

function canUseSharedAccounts() {
  return hasSupabaseClient() && currentSession.mode === 'user' && Boolean(currentSession.userId);
}

function getSharedRoleLabel(role, isOwner = false) {
  if (isOwner || role === 'owner') return 'Dueño';
  if (role === 'viewer') return 'Lector';
  return 'Editor';
}

function createSharedSectionTitle(text, count = null) {
  const title = document.createElement('strong');
  title.className = 'shared-list-title';
  title.textContent = count === null ? text : `${text} (${count})`;
  return title;
}

function renderSharedAccountRow(account, roleLabel, metaParts = []) {
  const bill = getActiveBill();
  const accountBill = account.account_state || {};
  const row = document.createElement('button');
  row.className = `shared-row shared-row-button ${bill.sharedAccountId === account.id ? 'active' : ''}`;
  row.type = 'button';

  const pendingCount = Number(account.pendingInvites || 0);
  const acceptedCount = Number(account.acceptedMembers || 0);
  const rejectedCount = Number(account.rejectedInvites || 0);
  const details = [
    roleLabel,
    accountBill.homeMonth || getBillModeLabel(accountBill.mode),
    ...metaParts,
    pendingCount > 0 ? `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : '',
    acceptedCount > 0 ? `${acceptedCount} aceptado${acceptedCount === 1 ? '' : 's'}` : '',
    rejectedCount > 0 ? `${rejectedCount} rechazado${rejectedCount === 1 ? '' : 's'}` : '',
  ].filter(Boolean);

  row.innerHTML = `
    <div>
      <strong>${escapeHtml(account.title || accountBill.name || 'Cuenta compartida')}</strong>
      <small>${escapeHtml(details.join(' · '))}</small>
    </div>
    <span aria-hidden="true">↗</span>
  `;
  row.addEventListener('click', () => openSharedAccount(account.id));
  return row;
}

function renderSharedPanel() {
  if (!dom.sharedAccountStatus) return;

  const bill = getActiveBill();
  const isUser = currentSession.mode === 'user';

  if (!isUser) {
    dom.sharedAccountStatus.innerHTML = '<p class="helper-text compact-text">Inicia sesión para compartir cuentas.</p>';
    dom.sharedAccountsList.innerHTML = '';
    dom.sharedInvitesList.innerHTML = '';
    return;
  }

  const pending = sharedInvitesCache.filter((invite) => invite.status === 'pending');
  const ownedAccounts = sharedAccountsCache.filter((account) => account.owner_id === currentSession.userId);
  const acceptedAsGuest = sharedAccountsCache.filter((account) => account.owner_id !== currentSession.userId);
  const currentRole = bill.sharedAccountId
    ? getSharedRoleLabel(bill.sharedRole, bill.sharedOwnerId === currentSession.userId)
    : 'Privada';
  const currentLabel = bill.sharedAccountId
    ? `Cuenta actual compartida · ${currentRole}`
    : 'Cuenta actual privada';

  dom.sharedAccountStatus.innerHTML = `
    <div class="shared-current-box">
      <strong>${escapeHtml(currentLabel)}</strong>
      <small>${pending.length} invitación${pending.length === 1 ? '' : 'es'} pendiente${pending.length === 1 ? '' : 's'} · ${ownedAccounts.length} creada${ownedAccounts.length === 1 ? '' : 's'} por mí · ${acceptedAsGuest.length} aceptada${acceptedAsGuest.length === 1 ? '' : 's'}</small>
    </div>
  `;

  dom.sharedInvitesList.innerHTML = '';

  if (pending.length) {
    dom.sharedInvitesList.appendChild(createSharedSectionTitle('Invitaciones pendientes', pending.length));
  }

  for (const invite of pending) {
    const row = document.createElement('div');
    row.className = 'shared-row shared-invite-card';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(invite.title || 'Cuenta compartida')}</strong>
        <small>Te invitaron como ${escapeHtml(getSharedRoleLabel(invite.role))}. Acepta para verla y editarla desde tu cuenta.</small>
      </div>
      <div class="shared-row-actions">
        <button class="btn btn-primary btn-small" type="button" data-action="accept">Aceptar</button>
        <button class="btn btn-light btn-small" type="button" data-action="reject">Rechazar</button>
      </div>
    `;
    row.querySelector('[data-action="accept"]').addEventListener('click', () => acceptSharedInvite(invite));
    row.querySelector('[data-action="reject"]').addEventListener('click', () => rejectSharedInvite(invite));
    dom.sharedInvitesList.appendChild(row);
  }

  dom.sharedAccountsList.innerHTML = '';

  if (!ownedAccounts.length && !acceptedAsGuest.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = pending.length
      ? 'Acepta una invitación para que aparezca como cuenta compartida.'
      : 'No hay cuentas compartidas cargadas.';
    dom.sharedAccountsList.appendChild(empty);
    return;
  }

  if (ownedAccounts.length) {
    dom.sharedAccountsList.appendChild(createSharedSectionTitle('Creadas por mí', ownedAccounts.length));
    for (const account of ownedAccounts) {
      dom.sharedAccountsList.appendChild(renderSharedAccountRow(account, 'Dueño'));
    }
  }

  if (acceptedAsGuest.length) {
    dom.sharedAccountsList.appendChild(createSharedSectionTitle('Compartidas conmigo', acceptedAsGuest.length));
    for (const account of acceptedAsGuest) {
      dom.sharedAccountsList.appendChild(renderSharedAccountRow(account, getSharedRoleLabel(account.role), ['Invitado']));
    }
  }
}

function isMissingSharedSqlError(error) {
  const message = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  return code === '42p01'
    || message.includes('does not exist')
    || message.includes('could not find the table')
    || details.includes('does not exist')
    || details.includes('could not find the table');
}

async function fetchSharedAccounts() {
  if (!canUseSharedAccounts() || sharedUiBusy) {
    renderSharedPanel();
    return;
  }

  sharedUiBusy = true;

  try {
    const { data: owned, error: ownedError } = await supabaseClient
      .from('shared_accounts')
      .select('id, owner_id, title, account_state, updated_at')
      .eq('owner_id', currentSession.userId)
      .order('updated_at', { ascending: false });

    if (ownedError) throw ownedError;

    const { data: memberships, error: membershipError } = await supabaseClient
      .from('shared_account_members')
      .select('account_id, role, status, created_at')
      .eq('user_id', currentSession.userId)
      .order('created_at', { ascending: false });

    if (membershipError) throw membershipError;

    const memberAccountIds = [...new Set((memberships || [])
      .map((item) => item.account_id)
      .filter(Boolean))];

    let memberAccounts = [];

    if (memberAccountIds.length) {
      const { data, error } = await supabaseClient
        .from('shared_accounts')
        .select('id, owner_id, title, account_state, updated_at')
        .in('id', memberAccountIds);

      if (error) throw error;
      memberAccounts = data || [];
    }

    const ownedAccountIds = (owned || []).map((account) => account.id).filter(Boolean);
    const ownedMemberStats = new Map();

    if (ownedAccountIds.length) {
      const { data: ownedMembers, error: ownedMembersError } = await supabaseClient
        .from('shared_account_members')
        .select('account_id, status')
        .in('account_id', ownedAccountIds);

      if (ownedMembersError) throw ownedMembersError;

      for (const member of ownedMembers || []) {
        const current = ownedMemberStats.get(member.account_id) || { pending: 0, accepted: 0, rejected: 0 };
        if (member.status === 'accepted') current.accepted += 1;
        if (member.status === 'pending') current.pending += 1;
        if (member.status === 'rejected') current.rejected += 1;
        ownedMemberStats.set(member.account_id, current);
      }
    }

    const accountById = new Map(memberAccounts.map((account) => [account.id, account]));

    const accepted = (memberships || [])
      .filter((item) => item.status === 'accepted' && accountById.has(item.account_id))
      .map((item) => ({ ...accountById.get(item.account_id), role: item.role }));

    sharedInvitesCache = (memberships || [])
      .filter((item) => item.status === 'pending')
      .map((item) => {
        const account = accountById.get(item.account_id) || {};
        return {
          accountId: item.account_id,
          role: item.role,
          status: item.status,
          title: account.title || account.account_state?.name || 'Cuenta compartida',
        };
      });

    const ownedWithStats = (owned || []).map((account) => {
      const stats = ownedMemberStats.get(account.id) || { pending: 0, accepted: 0, rejected: 0 };
      return {
        ...account,
        role: 'owner',
        pendingInvites: stats.pending,
        acceptedMembers: stats.accepted,
        rejectedInvites: stats.rejected,
      };
    });

    const merged = [...ownedWithStats, ...accepted];
    const seen = new Set();
    sharedAccountsCache = merged.filter((account) => {
      if (!account?.id || seen.has(account.id)) return false;
      seen.add(account.id);
      return true;
    });
  } catch (error) {
    console.error(error);
    if (isMissingSharedSqlError(error)) {
      showNotice('Cuentas compartidas no disponibles', 'Ejecuta sql/03-supabase-shared-accounts.sql en Supabase para activar invitaciones y edición compartida.');
    } else {
      showNotice('No se pudieron cargar compartidas', 'No pude actualizar tus cuentas compartidas. Revisa conexión, sesión de usuario o políticas RLS de Supabase.');
    }
  } finally {
    sharedUiBusy = false;
    renderSharedPanel();
  }
}

function sanitizeSupabaseSearch(value) {
  return String(value || '').trim().replace(/[%,]/g, '');
}

async function publishActiveBillAsShared() {
  if (!canUseSharedAccounts()) {
    showNotice('Inicia sesión', 'Debes iniciar sesión para compartir una cuenta con otras personas registradas.');
    return;
  }

  const bill = getActiveBill();

  if (!bill.people.length) {
    showNotice('Cuenta sin participantes', 'Agrega al menos una persona antes de compartir esta cuenta.');
    return;
  }

  if (!billHasAmounts(bill)) {
    const continueEmpty = confirm('La cuenta no tiene gastos ni montos. ¿Quieres compartirla de todas formas?');
    if (!continueEmpty) return;
  }

  try {
    const payload = {
      owner_id: currentSession.userId,
      title: bill.name || 'Cuenta compartida',
      account_state: { ...bill, sharedRole: 'owner', sharedOwnerId: currentSession.userId },
      updated_at: nowIso(),
    };

    if (bill.sharedAccountId) {
      const { error } = await supabaseClient.rpc('update_shared_account_safe', {
        p_account_id: bill.sharedAccountId,
        p_title: payload.title,
        p_account_state: payload.account_state,
      });
      if (error) throw error;
    } else {
      const { data, error } = await supabaseClient.rpc('create_shared_account_safe', {
        p_title: payload.title,
        p_account_state: payload.account_state,
      });
      if (error) throw error;
      bill.sharedAccountId = data;
      bill.sharedRole = 'owner';
      bill.sharedOwnerId = currentSession.userId;
      saveState();
    }

    await fetchSharedAccounts();
    showToast('Cuenta compartida actualizada.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo compartir', error.message || 'Ejecuta sql/03-supabase-shared-accounts.sql y vuelve a intentar.');
  }
}

async function inviteUserToSharedAccount() {
  if (!canUseSharedAccounts()) {
    showNotice('Inicia sesión', 'Debes iniciar sesión para invitar usuarios registrados.');
    return;
  }

  const bill = getActiveBill();

  if (!bill.sharedAccountId) {
    await publishActiveBillAsShared();
  }

  if (!getActiveBill().sharedAccountId) return;

  const rawQuery = dom.sharedInviteSearchInput?.value || prompt('Correo o nick del usuario registrado:');
  const query = sanitizeSupabaseSearch(rawQuery);

  if (!query) {
    showToast('Escribe un correo o nick registrado.');
    return;
  }

  try {
    const { data: profiles, error: profileError } = await supabaseClient
      .from('public_profiles')
      .select('id, email, nick, nombre')
      .or(`email.ilike.%${query}%,nick.ilike.%${query}%,nombre.ilike.%${query}%`)
      .limit(5);

    if (profileError) throw profileError;

    const profile = (profiles || []).find((item) => item.id !== currentSession.userId);

    if (!profile) {
      showNotice('Usuario no encontrado', 'La persona debe tener cuenta registrada y perfil público activo.');
      return;
    }

    const { data: existingMember, error: existingMemberError } = await supabaseClient
      .from('shared_account_members')
      .select('status, role')
      .eq('account_id', getActiveBill().sharedAccountId)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existingMemberError) throw existingMemberError;

    if (existingMember?.status === 'accepted') {
      showNotice('Ya participa', 'Esta persona ya aceptó la invitación y puede abrir la cuenta compartida.');
      return;
    }

    if (existingMember?.status === 'pending') {
      showNotice('Invitación pendiente', 'Esta persona ya tiene una invitación pendiente para esta cuenta.');
      return;
    }

    const { error } = await supabaseClient
      .from('shared_account_members')
      .upsert({
        account_id: getActiveBill().sharedAccountId,
        user_id: profile.id,
        role: 'editor',
        status: 'pending',
        invited_by: currentSession.userId,
        updated_at: nowIso(),
      }, { onConflict: 'account_id,user_id' });

    if (error) throw error;

    if (dom.sharedInviteSearchInput) dom.sharedInviteSearchInput.value = '';
    await fetchSharedAccounts();
    showToast(`Invitación enviada a ${profile.nick || profile.nombre || profile.email}.`);
  } catch (error) {
    console.error(error);
    showNotice('No se pudo invitar', 'No pude enviar la invitación. Revisa que la persona exista, que no esté repetida y que Supabase esté conectado.');
  }
}

async function acceptSharedInvite(invite) {
  if (!canUseSharedAccounts() || !invite?.accountId) return;

  try {
    const { error } = await supabaseClient
      .from('shared_account_members')
      .update({ status: 'accepted', updated_at: nowIso() })
      .eq('account_id', invite.accountId)
      .eq('user_id', currentSession.userId);

    if (error) throw error;

    await fetchSharedAccounts();
    await openSharedAccount(invite.accountId);
    showToast('Invitación aceptada.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo aceptar', 'No pude aceptar esta invitación. Actualiza compartidas y revisa que la sesión siga activa.');
  }
}

async function rejectSharedInvite(invite) {
  if (!canUseSharedAccounts() || !invite?.accountId) return;

  const confirmed = confirm(`¿Rechazar la invitación a "${invite.title || 'Cuenta compartida'}"?`);
  if (!confirmed) return;

  try {
    const { error } = await supabaseClient
      .from('shared_account_members')
      .update({ status: 'rejected', updated_at: nowIso() })
      .eq('account_id', invite.accountId)
      .eq('user_id', currentSession.userId);

    if (error) throw error;

    await fetchSharedAccounts();
    showToast('Invitación rechazada.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo rechazar', 'No pude rechazar esta invitación. Actualiza compartidas y revisa que la sesión siga activa.');
  }
}

async function openSharedAccount(accountId) {
  if (!canUseSharedAccounts()) return;

  try {
    const { data, error } = await supabaseClient
      .from('shared_accounts')
      .select('id, owner_id, title, account_state, updated_at')
      .eq('id', accountId)
      .single();

    if (error) throw error;

    const incoming = normalizeState({ bills: [data.account_state || makeDefaultBill()], activeBillId: (data.account_state || {}).id }).bills[0];
    const cachedAccount = sharedAccountsCache.find((account) => account.id === data.id);
    incoming.sharedAccountId = data.id;
    incoming.sharedOwnerId = data.owner_id;
    incoming.sharedRole = data.owner_id === currentSession.userId ? 'owner' : (cachedAccount?.role || 'editor');
    incoming.updatedAt = data.account_state?.updatedAt || data.updated_at || nowIso();

    const existingIndex = state.bills.findIndex((bill) => bill.sharedAccountId === data.id || bill.id === incoming.id);
    if (existingIndex >= 0) {
      state.bills[existingIndex] = incoming;
    } else {
      state.bills.unshift(incoming);
    }

    state.activeBillId = incoming.id;
    saveState();
    render();
    showToast('Cuenta compartida abierta.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo abrir', error.message || 'No tienes acceso a esa cuenta compartida.');
  }
}

function scheduleSharedActiveBillSave() {
  const bill = state?.bills?.find((item) => item.id === state.activeBillId);

  if (!bill?.sharedAccountId || !canUseSharedAccounts() || isCloudLoading) {
    return;
  }

  clearTimeout(sharedSaveTimer);
  sharedSaveTimer = setTimeout(saveSharedActiveBillNow, 450);
}

async function saveSharedActiveBillNow() {
  const bill = getActiveBill();

  if (!bill.sharedAccountId || !canUseSharedAccounts()) return;

  try {
    const { error } = await supabaseClient.rpc('update_shared_account_safe', {
      p_account_id: bill.sharedAccountId,
      p_title: bill.name || 'Cuenta compartida',
      p_account_state: bill,
    });

    if (error) throw error;
  } catch (error) {
    console.warn('No se pudo sincronizar cuenta compartida:', error);
  }
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
    const message = search
      ? 'No encontré cuentas con ese nombre.'
      : filter === 'paid'
        ? 'Todavía no tienes cuentas pagadas.'
        : filter === 'pending'
          ? 'No tienes cuentas pendientes visibles.'
          : filter === 'archived'
            ? 'No tienes cuentas archivadas.'
            : 'Todavía no tienes cuentas guardadas.';
    dom.billList.appendChild(emptyMessage(message));
    return;
  }

  for (const bill of filteredBills) {
    const calculation = calculateBill(bill);
    const status = getBillStatus(bill);
    const statusLabel = status === 'paid' ? 'Pagada' : status === 'archived' ? 'Archivada' : 'Pendiente';
    const row = document.createElement('article');
    row.className = `history-bill-card ${bill.id === state.activeBillId ? 'active' : ''} ${bill.archived ? 'archived' : ''}`;
    row.innerHTML = `
      <button class="bill-item history-bill-open" type="button" aria-label="Abrir ${escapeHtml(bill.name)}">
        <div>
          <strong>${escapeHtml(bill.name)}</strong>
          <span>${formatCurrency(calculation.grandTotal)} · ${bill.people.length} personas · ${statusLabel}</span>
          <span>${formatDate(bill.updatedAt)}</span>
        </div>
        <span class="bill-count">${bill.mode === 'quick' ? 'R' : bill.products.length}</span>
      </button>
      <div class="history-bill-actions" aria-label="Acciones de ${escapeHtml(bill.name)}">
        <button class="btn btn-light btn-small" data-action="edit" type="button">Editar</button>
        <button class="btn btn-danger-light btn-small" data-action="delete" type="button">Eliminar</button>
      </div>
    `;

    row.querySelector('.history-bill-open').addEventListener('click', () => {
      state.activeBillId = bill.id;
      accountSettingsPinnedOpenBillId = '';
      editingProductId = null;
      saveState();
      render();
      showToast('Cuenta seleccionada.');
    });

    row.querySelector('[data-action="edit"]').addEventListener('click', () => {
      editBillFromHistory(bill.id);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteBillFromHistory(bill.id);
    });

    dom.billList.appendChild(row);
  }
}

function getBillModeLabel(mode) {
  if (mode === 'quick') return 'Rápida';
  if (mode === 'home') return 'Hogar';
  return 'Detallada';
}

function renderAccountSettingsSummary(bill) {
  if (!dom.accountSettingsSummaryText) return;

  const modeDetail = bill.mode === 'quick'
    ? `Total rápido ${formatCurrency(Number(bill.quickTotal || 0))}`
    : bill.mode === 'home'
      ? `Mes ${bill.homeMonth || getCurrentMonthValue()}`
      : 'Cuenta detallada';
  dom.accountSettingsSummaryText.textContent = `${getBillModeLabel(bill.mode)} · ${modeDetail}`;

  if (!dom.accountSettingsPanel) return;

  const shouldStayOpen = accountSettingsPinnedOpenBillId === bill.id;

  if (dom.accountSettingsPanel.open !== shouldStayOpen) {
    suppressAccountSettingsToggle = true;
    dom.accountSettingsPanel.open = shouldStayOpen;
    requestAnimationFrame(() => {
      suppressAccountSettingsToggle = false;
    });
  }
}

function renderBillHeader() {
  const bill = getActiveBill();
  const isQuick = bill.mode === 'quick';
  const isHome = bill.mode === 'home';

  renderAccountSettingsSummary(bill);

  if (dom.currentListName) {
    dom.currentListName.textContent = bill.name || 'Nueva lista';
  }
  if (dom.currentListMeta) {
    const modeLabel = getBillModeLabel(bill.mode);
    const peopleCount = bill.people.length;
    const productCount = bill.mode === 'quick' ? (Number(bill.quickTotal || 0) > 0 ? 1 : 0) : bill.products.length;
    const sharedText = bill.sharedAccountId ? ' · Compartida' : '';
    const recurringText = bill.recurringGroupId ? ' · Recurrente' : '';
    dom.currentListMeta.textContent = `${modeLabel} · ${peopleCount} persona${peopleCount === 1 ? '' : 's'} · ${productCount} gasto${productCount === 1 ? '' : 's'}${sharedText}${recurringText}`;
  }

  dom.billNameInput.value = bill.name;
  const recurringLabel = bill.recurringGroupId ? ` · Recurrente` : '';
  const sharedLabel = bill.sharedAccountId ? ` · Compartida` : '';
  dom.billMeta.textContent = `Creada: ${formatDate(bill.createdAt)} · Última edición: ${formatDate(bill.updatedAt)}${recurringLabel}${sharedLabel}`;
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



function canUseRegisteredFriends() {
  return typeof supabaseClient !== 'undefined' && currentSession.mode === 'user' && Boolean(currentSession.userId);
}

async function fetchRegisteredFriendsForPicker() {
  if (!canUseRegisteredFriends()) {
    return [];
  }

  try {
    const { data: requests, error } = await supabaseClient
      .from('friend_requests')
      .select('id, requester_id, recipient_id, status')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${currentSession.userId},recipient_id.eq.${currentSession.userId}`);

    if (error) {
      console.error(error);
      return [];
    }

    const otherIds = [...new Set((requests || []).map((request) =>
      request.requester_id === currentSession.userId ? request.recipient_id : request.requester_id
    ))];

    if (!otherIds.length) {
      return [];
    }

    const { data: profiles, error: profileError } = await supabaseClient
      .from('public_profiles')
      .select('id, nick, nombre, email, telefono, avatar_data_url')
      .in('id', otherIds);

    if (profileError) {
      console.error(profileError);
      return [];
    }

    return (profiles || []).map((profile) => ({
      id: `registered_${profile.id}`,
      userId: profile.id,
      source: 'registered',
      name: profile.nick || profile.nombre || profile.email || 'Usuario',
      phone: normalizePhoneNumber(profile.telefono || ''),
      email: profile.email || '',
      avatarDataUrl: profile.avatar_data_url || '',
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function openFriendsPicker() {
  const manualFriends = getFriends().map((friend) => ({ ...friend, source: 'manual' }));
  const registeredFriends = await fetchRegisteredFriendsForPicker();
  friendsPickerItems = [...registeredFriends, ...manualFriends];

  if (friendsPickerItems.length === 0) {
    showNotice('Sin amigos guardados', 'Agrega amigos desde tu perfil. También puedes buscar usuarios registrados y enviar solicitudes de amistad.');
    return;
  }

  renderFriendsPicker();
  dom.friendsPickerModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeFriendsPicker() {
  dom.friendsPickerModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function renderFriendsPicker() {
  const bill = getActiveBill();
  const existingNames = new Set(bill.people.map((person) => person.name.toLowerCase()));

  dom.friendsPickerList.innerHTML = '';

  for (const friend of friendsPickerItems) {
    const alreadyInBill = existingNames.has(friend.name.toLowerCase());
    const row = document.createElement('label');
    row.className = `friend-picker-row ${alreadyInBill ? 'is-disabled' : ''}`;
    row.innerHTML = `
      <input type="checkbox" value="${friend.id}" ${alreadyInBill ? 'disabled' : ''} />
      <div class="friend-mini-avatar">${friend.avatarDataUrl ? `<img src="${friend.avatarDataUrl}" alt="" />` : getInitials(friend.name)}</div>
      <div>
        <strong>${escapeHtml(friend.name)}</strong>
        <small>${friend.source === 'registered' ? 'Usuario registrado' : 'Amigo manual'} · ${friend.phone ? escapeHtml(formatPhoneForDisplay(friend.phone)) : 'Sin teléfono'}${alreadyInBill ? ' · Ya está en esta cuenta' : ''}</small>
      </div>
    `;

    dom.friendsPickerList.appendChild(row);
  }
}

function addSelectedFriendsToBill() {
  const selected = [...dom.friendsPickerList.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.value);
  const friends = friendsPickerItems.filter((friend) => selected.includes(friend.id));

  if (friends.length === 0) {
    showToast('Selecciona al menos un amigo.');
    return;
  }

  const bill = getActiveBill();
  let added = 0;

  for (const friend of friends) {
    const exists = bill.people.some((person) => person.name.toLowerCase() === friend.name.toLowerCase());

    if (exists) {
      continue;
    }

    bill.people.push({
      id: createId('person'),
      name: friend.name,
      phone: normalizePhoneNumber(friend.phone || ''),
      email: normalizeEmail(friend.email || ''),
      userId: friend.userId || '',
      previousDebt: 0,
      paid: false,
    });

    added += 1;
  }

  if (added === 0) {
    showToast('No se agregaron personas nuevas.');
    return;
  }

  persistAndRender();
  closeFriendsPicker();
  showToast(`${added} amigo${added === 1 ? '' : 's'} agregado${added === 1 ? '' : 's'} a la cuenta.`);
}

function getSelfParticipantInfo() {
  if (currentSession.mode !== 'user' || !currentSession.userId) {
    return null;
  }

  const profile = getProfile();
  const displayName = profile.nick || profile.name || currentSession.name || currentSession.email || 'Yo';

  return {
    userId: currentSession.userId,
    email: normalizeEmail(currentSession.email || ''),
    name: String(displayName || 'Yo').trim() || 'Yo',
    phone: normalizePhoneNumber(profile.phone || ''),
  };
}

function personMatchesSelf(person, selfInfo = getSelfParticipantInfo()) {
  if (!person || !selfInfo) return false;
  const personUserId = String(person.userId || '').trim();
  const personEmail = normalizeEmail(person.email || '');

  return Boolean(
    (selfInfo.userId && personUserId && personUserId === selfInfo.userId) ||
    (selfInfo.email && personEmail && personEmail === selfInfo.email)
  );
}

function findSelfPerson(bill = getActiveBill(), selfInfo = getSelfParticipantInfo()) {
  if (!bill || !Array.isArray(bill.people) || !selfInfo) return null;
  return bill.people.find((person) => personMatchesSelf(person, selfInfo)) || null;
}

function getPotentialSelfNameMatches(bill = getActiveBill(), selfInfo = getSelfParticipantInfo()) {
  if (!bill || !Array.isArray(bill.people) || !selfInfo) return [];
  const profile = getProfile();
  const names = new Set([
    selfInfo.name,
    profile.nick,
    profile.name,
    currentSession.name,
    currentSession.email,
  ].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean));

  return bill.people.filter((person) => names.has(String(person.name || '').trim().toLowerCase()));
}

function updatePersonWithSelfProfile(person, selfInfo = getSelfParticipantInfo()) {
  if (!person || !selfInfo) return;
  person.userId = selfInfo.userId;
  person.email = selfInfo.email;
  person.phone = selfInfo.phone || normalizePhoneNumber(person.phone || '');
  person.name = selfInfo.name || person.name || 'Yo';
}

function addCurrentUserAsPerson() {
  const selfInfo = getSelfParticipantInfo();

  if (!selfInfo) {
    showNotice('Inicia sesión para usar “Yo”', 'Esta opción vincula la persona con tu perfil registrado. Puedes seguir agregando personas manualmente en modo invitado.');
    return;
  }

  const bill = getActiveBill();
  const existing = findSelfPerson(bill, selfInfo);

  if (existing) {
    updatePersonWithSelfProfile(existing, selfInfo);
    persistAndRender();
    showToast('Tu perfil ya está en esta lista.');
    return;
  }

  const nameMatches = getPotentialSelfNameMatches(bill, selfInfo);

  if (nameMatches.length === 1) {
    const confirmed = confirm(`Ya existe “${nameMatches[0].name}” en esta lista. ¿Quieres vincular esa persona con tu perfil?`);
    if (!confirmed) return;

    updatePersonWithSelfProfile(nameMatches[0], selfInfo);
    persistAndRender();
    showToast('Persona vinculada a tu perfil.');
    return;
  }

  if (nameMatches.length > 1) {
    showNotice('Nombre repetido', 'Hay más de una persona que podría ser tu perfil. Edita o elimina duplicados antes de usar “Yo”.');
    return;
  }

  bill.people.push({
    id: createId('person'),
    name: selfInfo.name,
    phone: selfInfo.phone,
    email: selfInfo.email,
    userId: selfInfo.userId,
    previousDebt: 0,
    paid: false,
  });

  persistAndRender();
  showToast('Te agregué a la lista.');
}

function renderSelfParticipantCard() {
  if (!dom.selfParticipantCard || !dom.addMePersonButton) return;

  const selfInfo = getSelfParticipantInfo();
  const bill = getActiveBill();
  const existing = findSelfPerson(bill, selfInfo);
  const infoText = dom.selfParticipantCard.querySelector('span');
  const title = dom.selfParticipantCard.querySelector('strong');

  dom.selfParticipantCard.classList.toggle('is-disabled', !selfInfo);
  dom.selfParticipantCard.classList.toggle('is-linked', Boolean(existing));
  dom.addMePersonButton.disabled = Boolean(existing);

  if (!selfInfo) {
    if (title) title.textContent = 'Agregar mi perfil';
    if (infoText) infoText.textContent = 'Inicia sesión para agregarte como “Yo” y vincular movimientos a tus estadísticas.';
    dom.addMePersonButton.textContent = '+ Yo';
    return;
  }

  if (existing) {
    if (title) title.textContent = `${selfInfo.name} está en esta lista`;
    if (infoText) infoText.textContent = 'Esta persona está vinculada a tu perfil y sus movimientos impactan tus estadísticas.';
    dom.addMePersonButton.textContent = 'Ya agregado';
    return;
  }

  if (title) title.textContent = 'Agregarme a esta lista';
  if (infoText) infoText.textContent = `Agrega “${selfInfo.name}” como participante vinculado a tu perfil.`;
  dom.addMePersonButton.textContent = '+ Yo';
}


function renderPeople() {
  const bill = getActiveBill();
  renderSelfParticipantCard();
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
        <strong title="${escapeHtml(person.name)}">${escapeHtml(person.name)}${personMatchesSelf(person) ? ' <span class="self-person-badge">Yo</span>' : ''}</strong>
        <small>${hasPhone ? escapeHtml(formatPhoneForDisplay(person.phone)) : 'Sin teléfono'}${Number(person.previousDebt || 0) > 0 ? ` · Arrastre ${formatCurrency(person.previousDebt)}` : ''}</small>
      </div>
      <button class="icon-button whatsapp ${hasPhone ? '' : 'muted'}" type="button" aria-label="Enviar WhatsApp a ${escapeHtml(person.name)}">WA</button>
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

    if (dom.splitModeHelp) {
      dom.splitModeHelp.textContent = 'Útil para plataformas o gastos donde una persona paga por otra. Ejemplo: Carlos paga 2 partes, Wladimir 2 y Pamela 1.';
    }

    return;
  }

  dom.consumerPanelTitle.textContent = bill.mode === 'home' ? '¿Entre quiénes se divide?' : '¿Quiénes consumieron?';
  dom.consumerPanelHelp.textContent = bill.mode === 'home'
    ? 'Marca las personas que participan en este gasto y ajusta las partes si corresponde.'
    : 'Marca las personas y ajusta las partes si alguien consumió más.';

  if (dom.splitModeHelp) {
    dom.splitModeHelp.textContent = bill.mode === 'home'
      ? 'Divide este gasto entre las personas seleccionadas.'
      : 'Usa esta opción cuando cada persona consume una parte del producto o gasto.';
  }
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
  if (dom.sidebarGrandTotalOutput) dom.sidebarGrandTotalOutput.textContent = formatCurrency(calculation.grandTotal);
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


function renderProfilePayerSummary() {
  if (!dom.profilePayerSummary || !dom.profilePayerDebtorsList) return;

  const bill = getActiveBill();
  const selfInfo = getSelfParticipantInfo();
  const selfPerson = findSelfPerson(bill, selfInfo);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const calculation = calculateBill(bill);

  const shouldShow = Boolean(selfInfo && selfPerson && payer && payer.id === selfPerson.id);
  dom.profilePayerSummary.classList.toggle('hidden', !shouldShow);

  if (!shouldShow) {
    dom.profilePayerDebtorsList.innerHTML = '';
    return;
  }

  const myAmount = calculation.finalTotals[selfPerson.id] || 0;
  const pendingDebtors = bill.people
    .filter((person) => person.id !== selfPerson.id)
    .map((person) => ({ person, amount: calculation.finalTotals[person.id] || 0 }))
    .filter((item) => item.amount > 0 && !item.person.paid);
  const totalReceivable = pendingDebtors.reduce((sum, item) => sum + item.amount, 0);
  const totalToReceive = bill.people
    .filter((person) => person.id !== selfPerson.id)
    .reduce((sum, person) => sum + (calculation.finalTotals[person.id] || 0), 0);

  dom.profilePayerTitle.textContent = `${selfPerson.name} pagó esta cuenta`;
  dom.profilePayerHelp.textContent = `Tu parte es ${formatCurrency(myAmount)}. En total deberían transferirte ${formatCurrency(totalToReceive)}.`;
  dom.profilePayerPaidOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.profilePayerOwnOutput.textContent = formatCurrency(myAmount);
  dom.profilePayerReceivableOutput.textContent = formatCurrency(totalReceivable);
  dom.profilePayerDebtorsList.innerHTML = '';

  if (pendingDebtors.length === 0) {
    dom.profilePayerDebtorsList.appendChild(emptyMessage('No tienes cobros pendientes en esta cuenta.'));
    return;
  }

  for (const { person, amount } of pendingDebtors) {
    const row = document.createElement('div');
    row.className = 'profile-payer-debtor-row';
    row.innerHTML = `
      <span>${escapeHtml(person.name)}</span>
      <strong>${formatCurrency(amount)}</strong>
    `;
    dom.profilePayerDebtorsList.appendChild(row);
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
  renderAuthUI();
  renderQuickProducts();
  renderBillList();
  renderRecurringGroups();
  renderSharedPanel();
  renderBillHeader();
  renderPayerSelect();
  renderPeople();
  renderProductForm();
  renderCategoryTotals();
  renderProducts();
  renderHomeDashboard();
  renderRecurringDashboard();
  renderTotals();
  renderProfilePayerSummary();
  renderTransfers();
  try {
    renderGuidedExperience();
  } catch (error) {
    console.warn('No se pudo renderizar la experiencia guiada:', error);
  }

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
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
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
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
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

function editBillFromHistory(billId) {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) {
    showToast('No encontré esa cuenta en el historial.');
    return;
  }

  state.activeBillId = bill.id;
  accountSettingsPinnedOpenBillId = bill.id;
  editingProductId = null;
  saveState();
  render();
  setAppSection('settings', { scroll: false });
  dom.accountSettingsPanel?.setAttribute('open', '');
  showToast('Cuenta lista para editar.');
}

function deleteBillFromHistory(billId) {
  if (state.bills.length <= 1) {
    showToast('Debe existir al menos una cuenta.');
    return;
  }

  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) {
    showToast('No encontré esa cuenta en el historial.');
    return;
  }

  const confirmed = confirm(`¿Eliminar "${bill.name}" del historial? Esta acción no se puede deshacer.`);
  if (!confirmed) return;

  state.bills = state.bills.filter((item) => item.id !== bill.id);

  if (state.activeBillId === bill.id) {
    state.activeBillId = state.bills[0]?.id || makeDefaultBill().id;
  }

  editingProductId = null;
  saveState();
  render();
  showToast('Cuenta eliminada del historial.');
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
    email: '',
    userId: '',
    previousDebt: 0,
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

  if (!bill.people.length) {
    showToast('Agrega personas antes de marcar pagos.');
    return;
  }

  bill.people = bill.people.map((person) => ({ ...person, paid }));
  persistAndRender();
  showToast(paid ? 'Todos quedaron como pagados.' : 'Todos quedaron como pendientes.');
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
    email: normalizeEmail(person.email || ''),
    userId: person.userId || '',
    previousDebt: Math.max(0, Number(person.previousDebt || 0)),
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
        email: normalizeEmail(person.email || ''),
        userId: String(person.userId || ''),
        previousDebt: Math.max(0, Number(person.previousDebt || 0)),
        paid: Boolean(person.paid),
      }))
    : [];

  const bill = {
    id: createId('bill'),
    name: `${String(data.name || 'Cuenta compartida')} compartida`,
    mode: ['quick', 'home'].includes(data.mode) ? data.mode : 'detailed',
    quickTotal: Number(data.quickTotal || 0),
    homeMonth: data.homeMonth || getCurrentMonthValue(),
    tipPercent: Number.isFinite(Number(data.tipPercent)) ? Number(data.tipPercent) : 10,
    payerId: Number.isInteger(data.payerIndex) && people[data.payerIndex] ? people[data.payerIndex].id : '',
    archived: false,
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
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
    version: 5,
    profile: {
      mode: currentSession.mode,
      email: currentSession.email || '',
      name: currentSession.name || '',
      storageKey: activeStorageKey,
    },
    state,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const profileName = currentSession.mode === 'user'
    ? currentSession.email.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
    : 'invitado';

  link.href = url;
  link.download = `cuenta-clara-respaldo-${profileName}-${new Date().toISOString().slice(0, 10)}.json`;
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

      if (!importedState || !Array.isArray(importedState.bills)) {
        throw new Error('El archivo no contiene cuentas válidas.');
      }

      const profileLabel = currentSession.mode === 'user'
        ? `el usuario ${currentSession.email}`
        : 'el modo invitado';

      const confirmed = confirm(`¿Importar este respaldo? Reemplazará las cuentas guardadas en ${profileLabel}.`);

      if (!confirmed) return;

      state = normalizeState(importedState);
      migrateEmptyDefaultPeople();
      saveState();
      render();
      showToast('Respaldo importado.');
    } catch {
      showNotice('Respaldo inválido', 'No se pudo leer el archivo seleccionado o no contiene datos válidos de Cuenta Clara.');
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


dom.receiptButton.addEventListener('click', openReceiptModal);
dom.closeReceiptModalButton.addEventListener('click', closeReceiptModal);
dom.receiptModal.addEventListener('click', (event) => { if (event.target === dom.receiptModal) closeReceiptModal(); });
dom.receiptFileInput.addEventListener('change', handleReceiptFileChange);
dom.processReceiptButton.addEventListener('click', processReceiptImage);
dom.clearReceiptButton.addEventListener('click', clearReceiptReader);
if (dom.reparseReceiptTextButton) {
  dom.reparseReceiptTextButton.addEventListener('click', reparseReceiptRawText);
}
dom.selectAllReceiptItemsButton.addEventListener('click', () => setAllReceiptItems(true));
dom.unselectAllReceiptItemsButton.addEventListener('click', () => setAllReceiptItems(false));
dom.addReceiptItemsButton.addEventListener('click', addReceiptItemsToBill);


dom.authButton && dom.authButton.addEventListener('click', openAuthModal);
dom.authStatusBadge && dom.authStatusBadge.addEventListener('click', handleAuthBadgeClick);
dom.closeAuthModalButton && dom.closeAuthModalButton.addEventListener('click', closeAuthModal);
if (dom.authModal) {
  dom.authModal.addEventListener('click', (event) => {
    if (event.target === dom.authModal) {
      closeAuthModal();
    }
  });
}
dom.showLoginButton && dom.showLoginButton.addEventListener('click', showLoginForm);
dom.showRegisterButton && dom.showRegisterButton.addEventListener('click', showRegisterForm);
dom.loginForm && dom.loginForm.addEventListener('submit', loginLocalUser);
dom.registerForm && dom.registerForm.addEventListener('submit', registerLocalUser);
dom.continueGuestButton && dom.continueGuestButton.addEventListener('click', switchToGuestMode);
dom.switchToGuestButton && dom.switchToGuestButton.addEventListener('click', switchToGuestMode);
dom.logoutButton && dom.logoutButton.addEventListener('click', logoutLocalUser);


dom.profileTabs?.forEach((button) => {
  button.addEventListener('click', () => {
    setProfileTab(button.dataset.profileTab || 'profile');
    renderProfilePanels();
  });
});

dom.saveProfileButton && dom.saveProfileButton.addEventListener('click', saveProfileFromModal);
dom.savePreferencesButton && dom.savePreferencesButton.addEventListener('click', saveProfilePreferences);
dom.syncNowButton && dom.syncNowButton.addEventListener('click', async () => {
  const saved = await saveCloudStateNow({ force: true, message: 'Guardando...' });
  showToast(saved ? 'Guardado en Supabase.' : 'No se pudo guardar en Supabase. Quedó guardado localmente.');
});

dom.installAppButton.addEventListener('click', installApp);
dom.themeToggle.addEventListener('click', toggleTheme);

dom.sectionNavButtons?.forEach((button) => {
  button.addEventListener('click', () => setAppSection(button.dataset.appSection));
});

dom.guidedChoiceButtons?.forEach((button) => {
  button.addEventListener('click', () => applyGuidedMode(button.dataset.guidedMode));
});


dom.accountSettingsPanel?.addEventListener('toggle', () => {
  if (suppressAccountSettingsToggle) return;
  const bill = getActiveBill();
  accountSettingsPinnedOpenBillId = dom.accountSettingsPanel.open ? bill.id : '';
});

dom.smartActionButton?.addEventListener('click', handleSmartAction);
dom.simpleModeButton?.addEventListener('click', () => setExperienceMode('simple'));
dom.advancedModeButton?.addEventListener('click', () => setExperienceMode('advanced'));
dom.manualProductMethodButton?.addEventListener('click', focusManualProductForm);
dom.receiptMethodButton?.addEventListener('click', openReceiptModal);
dom.quickProductMethodButton?.addEventListener('click', showQuickProductsArea);


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
    accountSettingsPinnedOpenBillId = bill.id;
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
if (dom.createRecurringGroupButton) {
  dom.createRecurringGroupButton.addEventListener('click', createRecurringGroupFromActiveBill);
}
if (dom.createNextRecurringMonthButton) {
  dom.createNextRecurringMonthButton.addEventListener('click', createNextRecurringMonthFromActive);
}
if (dom.createNextRecurringMonthButtonInline) {
  dom.createNextRecurringMonthButtonInline.addEventListener('click', createNextRecurringMonthFromActive);
}
if (dom.publishSharedAccountButton) {
  dom.publishSharedAccountButton.addEventListener('click', publishActiveBillAsShared);
}
if (dom.inviteSharedUserButton) {
  dom.inviteSharedUserButton.addEventListener('click', inviteUserToSharedAccount);
}
if (dom.refreshSharedAccountsButton) {
  dom.refreshSharedAccountsButton.addEventListener('click', fetchSharedAccounts);
}
if (dom.sharedInviteSearchInput) {
  dom.sharedInviteSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      inviteUserToSharedAccount();
    }
  });
}

dom.payerSelect.addEventListener('change', () => {
  const bill = getActiveBill();
  bill.payerId = dom.payerSelect.value;
  accountSettingsPinnedOpenBillId = '';
  persistAndRender();
});

dom.personForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addPerson(dom.personNameInput.value, dom.personPhoneInput.value);
});

if (dom.addMePersonButton) {
  dom.addMePersonButton.addEventListener('click', addCurrentUserAsPerson);
}

dom.markAllPaidButton.addEventListener('click', () => markAllPaid(true));
dom.markAllPendingButton.addEventListener('click', () => markAllPaid(false));


if (dom.openFriendsPickerButton) {
  dom.openFriendsPickerButton.addEventListener('click', openFriendsPicker);
}

if (dom.closeFriendsPickerButton) {
  dom.closeFriendsPickerButton.addEventListener('click', closeFriendsPicker);
}

if (dom.friendsPickerModal) {
  dom.friendsPickerModal.addEventListener('click', (event) => {
    if (event.target === dom.friendsPickerModal) {
      closeFriendsPicker();
    }
  });
}

if (dom.addSelectedFriendsButton) {
  dom.addSelectedFriendsButton.addEventListener('click', addSelectedFriendsToBill);
}



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
if (dom.exportExcelButton) {
  dom.exportExcelButton.addEventListener('click', exportExcel);
}
dom.mobileShareButton.addEventListener('click', openShareModal);
dom.mobileAddProductButton.addEventListener('click', () => {
  const bill = getActiveBill();

  if (bill.mode === 'quick') {
    scrollToGuideTarget(dom.quickTotalInput);
  } else {
    scrollToGuideTarget(dom.productNameInput);
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

  if (event.key === 'Escape' && !dom.receiptModal.classList.contains('hidden')) {
    closeReceiptModal();
  }

  if (dom.friendsPickerModal && event.key === 'Escape' && !dom.friendsPickerModal.classList.contains('hidden')) {
    closeFriendsPicker();
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

async function initApp() {
  initTheme();
  initExperienceMode();
  updateInstallButton();
  await initializeAuthSession();
  loadState();

  if (currentSession.mode === 'user') {
    await loadCloudState();
    await savePublicProfileFromMain();
    await fetchSharedAccounts();
  }

  migrateEmptyDefaultPeople();
  importBillFromUrl();
  saveState();
  render();
  initAppSections();
  initServiceWorker();

  if (hasSupabaseClient()) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        return;
      }

      if (session?.user && currentSession.userId !== session.user.id) {
        setUserSession(session.user);
        saveAuthSession();
        await loadCloudState();
        await savePublicProfileFromMain();
        await fetchSharedAccounts();
        migrateEmptyDefaultPeople();
        saveState();
        render();
      }
    });
  }
}

initApp().catch((error) => {
  console.error('Error al iniciar Cuenta Clara:', error);
  const message = error?.message || 'Error desconocido al iniciar la app.';
  try {
    showNotice('Error al iniciar la app', message);
  } catch {
    alert(`Error al iniciar Cuenta Clara: ${message}`);
  }
});
