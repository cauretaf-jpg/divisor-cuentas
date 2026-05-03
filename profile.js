console.info('Cuenta Clara Perfil V10.8 cargado');

const GUEST_STORAGE_KEY = 'cuenta-clara-v1-state';
let currentUser = null;
let state = null;
let editingFriendId = null;
let activeProfileSection = 'perfil';
let activeStatsPanel = 'resumen';

const dom = {
  pageAvatar: document.querySelector('#pageAvatar'),
  title: document.querySelector('#pageProfileTitle'),
  subtitle: document.querySelector('#pageProfileSubtitle'),
  loginRequiredCard: document.querySelector('#loginRequiredCard'),
  sections: document.querySelectorAll('.profile-page-section:not(#loginRequiredCard)'),
  pageTabs: document.querySelectorAll('[data-page-profile-tab]'),
  nick: document.querySelector('#pageNickInput'),
  name: document.querySelector('#pageNameInput'),
  phone: document.querySelector('#pagePhoneInput'),
  email: document.querySelector('#pageEmailInput'),
  avatarFile: document.querySelector('#avatarFileInput'),
  removeAvatar: document.querySelector('#removeAvatarButton'),
  currency: document.querySelector('#pageCurrencyInput'),
  themePreference: document.querySelector('#pageThemePreferenceInput'),
  save: document.querySelector('#saveFullProfileButton'),
  sync: document.querySelector('#syncProfileButton'),
  logout: document.querySelector('#profileLogoutButton'),
  themeToggle: document.querySelector('#profileThemeToggle'),
  toast: document.querySelector('#profileToast'),
  friendForm: document.querySelector('#friendForm'),
  friendName: document.querySelector('#friendNameInput'),
  friendPhone: document.querySelector('#friendPhoneInput'),
  friendEmail: document.querySelector('#friendEmailInput'),
  friendNotes: document.querySelector('#friendNotesInput'),
  cancelFriendEdit: document.querySelector('#cancelFriendEditButton'),
  userSearchInput: document.querySelector('#userSearchInput'),
  searchUsersButton: document.querySelector('#searchUsersButton'),
  userSearchResults: document.querySelector('#userSearchResults'),
  incomingRequestsCount: document.querySelector('#incomingRequestsCount'),
  incomingRequestsList: document.querySelector('#incomingRequestsList'),
  outgoingRequestsCount: document.querySelector('#outgoingRequestsCount'),
  outgoingRequestsList: document.querySelector('#outgoingRequestsList'),
  registeredFriendsCount: document.querySelector('#registeredFriendsCount'),
  registeredFriendsList: document.querySelector('#registeredFriendsList'),
  friendsList: document.querySelector('#friendsPageList'),
  statTotalBills: document.querySelector('#pageStatTotalBills'),
  statActiveBills: document.querySelector('#pageStatActiveBills'),
  statHistoricalTotal: document.querySelector('#pageStatHistoricalTotal'),
  statAverageBill: document.querySelector('#pageStatAverageBill'),
  statPeopleCount: document.querySelector('#pageStatPeopleCount'),
  statUniquePeopleCount: document.querySelector('#pageStatUniquePeopleCount'),
  statUniquePeopleMirror: document.querySelector('#pageStatUniquePeopleMirror'),
  statProductCount: document.querySelector('#pageStatProductCount'),
  statSharedBills: document.querySelector('#pageStatSharedBills'),
  statPaidRate: document.querySelector('#pageStatPaidRate'),
  statHomeBills: document.querySelector('#pageStatHomeBills'),
  statOutingBills: document.querySelector('#pageStatOutingBills'),
  statBiggestBill: document.querySelector('#pageStatBiggestBill'),
  statTopMonth: document.querySelector('#pageStatTopMonth'),
  statMyAssignedTotal: document.querySelector('#pageStatMyAssignedTotal'),
  statMyPendingTotal: document.querySelector('#pageStatMyPendingTotal'),
  statPaidBills: document.querySelector('#pageStatPaidBills'),
  statPendingBills: document.querySelector('#pageStatPendingBills'),
  statPaidTotal: document.querySelector('#pageStatPaidTotal'),
  statPendingTotal: document.querySelector('#pageStatPendingTotal'),
  statMyPaidAsPayerTotal: document.querySelector('#pageStatMyPaidAsPayerTotal'),
  statMyOwnShareAsPayer: document.querySelector('#pageStatMyOwnShareAsPayer'),
  statMyReceivableTotal: document.querySelector('#pageStatMyReceivableTotal'),
  statRecurringGroups: document.querySelector('#pageStatRecurringGroups'),
  statRecurringMonths: document.querySelector('#pageStatRecurringMonths'),
  statRecurringPending: document.querySelector('#pageStatRecurringPending'),
  statCarryoverTotal: document.querySelector('#pageStatCarryoverTotal'),
  topCategories: document.querySelector('#pageTopCategories'),
  topPeople: document.querySelector('#pageTopPeople'),
  topPeopleAmounts: document.querySelector('#pageTopPeopleAmounts'),
  pendingPeople: document.querySelector('#pagePendingPeople'),
  myReceivablePeople: document.querySelector('#pageMyReceivablePeople'),
  topBills: document.querySelector('#pageTopBills'),
  monthlyTotals: document.querySelector('#pageMonthlyTotals'),
  recurringSummary: document.querySelector('#pageRecurringSummary'),
  paymentSummary: document.querySelector('#pagePaymentSummary'),
  quickInsights: document.querySelector('#pageQuickInsights'),
  recentActivity: document.querySelector('#pageRecentActivity'),
  milestones: document.querySelector('#pageMilestones'),
  lastActivity: document.querySelector('#pageLastActivity'),
  statsTabs: document.querySelectorAll('[data-profile-stats-tab]'),
  statsPanels: document.querySelectorAll('[data-profile-stats-panel]'),
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePhoneNumber(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) digits = `56${digits}`;
  if (digits.length === 10 && digits.startsWith('09')) digits = `56${digits.slice(1)}`;
  return digits;
}

function formatPhoneForDisplay(value) {
  const digits = normalizePhoneNumber(value);
  if (!digits) return '';
  if (digits.startsWith('56') && digits.length === 11) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

function getInitials(value) {
  const parts = String(value || 'CC').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((part) => part.charAt(0).toUpperCase()).join('') : 'CC';
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => dom.toast.classList.add('hidden'), 2400);
}

function getUserStorageKey(userId) {
  return `cuenta-clara-supabase-state:${userId}`;
}

function makeDefaultProfile(input = {}) {
  return {
    nick: String(input.nick || input.displayName || '').trim(),
    name: String(input.name || '').trim(),
    phone: normalizePhoneNumber(input.phone || ''),
    avatarDataUrl: String(input.avatarDataUrl || input.avatar || '').startsWith('data:image/') ? String(input.avatarDataUrl || input.avatar) : '',
    currency: input.currency === 'CLP' ? 'CLP' : 'CLP',
    themePreference: ['system', 'light', 'dark'].includes(input.themePreference) ? input.themePreference : 'system',
    createdAt: input.createdAt || nowIso(),
    updatedAt: input.updatedAt || nowIso(),
  };
}

function normalizeFriends(input = []) {
  if (!Array.isArray(input)) return [];
  return input.map((friend) => ({
    id: friend.id || createId('friend'),
    name: String(friend.name || '').trim(),
    phone: normalizePhoneNumber(friend.phone || ''),
    email: String(friend.email || '').trim(),
    notes: String(friend.notes || '').trim(),
    avatarDataUrl: String(friend.avatarDataUrl || '').startsWith('data:image/') ? String(friend.avatarDataUrl) : '',
    createdAt: friend.createdAt || nowIso(),
    updatedAt: friend.updatedAt || friend.createdAt || nowIso(),
  })).filter((friend) => friend.name);
}

function normalizeState(input) {
  const safe = input && typeof input === 'object' ? input : {};
  return {
    bills: Array.isArray(safe.bills) ? safe.bills : [],
    activeBillId: safe.activeBillId || '',
    quickProducts: Array.isArray(safe.quickProducts) ? safe.quickProducts : [],
    profile: makeDefaultProfile(safe.profile || {}),
    friends: normalizeFriends(safe.friends || []),
  };
}

function getDisplayName() {
  const profile = state?.profile || {};
  return profile.nick || profile.name || currentUser?.user_metadata?.nombre || currentUser?.email || 'Usuario';
}

async function loadState() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  currentUser = sessionData?.session?.user || null;

  if (!currentUser) {
    state = null;
    render();
    return;
  }

  const { data, error } = await supabaseClient
    .from('app_states')
    .select('state')
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    const local = localStorage.getItem(getUserStorageKey(currentUser.id));
    state = normalizeState(local ? JSON.parse(local) : null);
    showToast('No se pudo cargar Supabase. Usando copia local.');
    render();
    return;
  }

  state = normalizeState(data?.state || JSON.parse(localStorage.getItem(getUserStorageKey(currentUser.id)) || 'null'));
  localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(state));
  await ensurePublicProfile();
  render();
}

async function saveState() {
  if (!currentUser || !state) return;

  state.profile = makeDefaultProfile(state.profile || {});
  state.friends = normalizeFriends(state.friends || []);
  localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(state));

  const { error } = await supabaseClient
    .from('app_states')
    .upsert({
      user_id: currentUser.id,
      state,
      updated_at: nowIso(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error(error);
    showToast('No se pudo sincronizar con Supabase.');
    return;
  }

  showToast('Guardado en la nube.');
}

function renderAvatar() {
  const profile = state.profile;
  const display = getDisplayName();

  if (profile.avatarDataUrl) {
    dom.pageAvatar.innerHTML = `<img src="${profile.avatarDataUrl}" alt="Foto de perfil" />`;
  } else {
    dom.pageAvatar.textContent = getInitials(display);
  }
}

function renderProfileForm() {
  const profile = state.profile;
  const display = getDisplayName();

  dom.title.textContent = display;
  dom.subtitle.textContent = currentUser?.email || '';
  dom.nick.value = profile.nick || '';
  dom.name.value = profile.name || currentUser?.user_metadata?.nombre || '';
  dom.phone.value = profile.phone ? formatPhoneForDisplay(profile.phone) : '';
  dom.email.value = currentUser?.email || '';
  dom.currency.value = profile.currency || 'CLP';
  dom.themePreference.value = profile.themePreference || 'system';

  renderAvatar();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeTextKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function addToMap(map, key, amount) {
  const cleanKey = String(key || '').trim() || 'Sin categoría';
  map.set(cleanKey, (map.get(cleanKey) || 0) + (Number(amount) || 0));
}

function getBillDateValue(bill) {
  return bill?.updatedAt || bill?.createdAt || '';
}

function getBillMonthLabel(bill) {
  const directMonth = String(bill?.homeMonth || '').slice(0, 7);
  if (/^\d{4}-\d{2}$/.test(directMonth)) return directMonth;
  const date = getBillDateValue(bill);
  return /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : 'Sin mes';
}

function getBillModeLabel(mode) {
  if (mode === 'home') return 'Hogar';
  if (mode === 'quick') return 'Rápida';
  return 'Salida';
}

function getProfileMatchKeys() {
  const profile = state?.profile || {};
  return new Set([
    currentUser?.id,
    currentUser?.email,
    currentUser?.user_metadata?.nombre,
    currentUser?.user_metadata?.name,
    profile.nick,
    profile.name,
  ].map(normalizeTextKey).filter(Boolean));
}

function personMatchesProfile(person, matchKeys) {
  if (!person || !matchKeys?.size) return false;
  return [person.userId, person.email, person.name].some((value) => matchKeys.has(normalizeTextKey(value)));
}

function calculateBillSnapshot(bill) {
  const people = Array.isArray(bill?.people) ? bill.people : [];
  const products = Array.isArray(bill?.products) ? bill.products : [];
  const baseTotals = Object.fromEntries(people.map((person) => [person.id, 0]));
  const categoryTotals = new Map();

  if (bill?.mode === 'quick') {
    const quickTotal = Math.max(0, Number(bill.quickTotal || 0));
    if (people.length && quickTotal > 0) {
      const perPerson = quickTotal / people.length;
      for (const person of people) {
        baseTotals[person.id] = perPerson;
      }
      addToMap(categoryTotals, 'Otros', quickTotal);
    }
  } else {
    for (const product of products) {
      const productTotal = Math.max(0, Number(product.unitPrice || 0) * Number(product.quantity || 1));
      const validConsumers = Array.isArray(product.consumers)
        ? product.consumers.filter((consumer) => people.some((person) => person.id === consumer.personId))
        : [];
      const totalShares = validConsumers.reduce((sum, consumer) => sum + Math.max(1, Number(consumer.share || 1)), 0);
      const category = product.category || 'Otros';

      addToMap(categoryTotals, category, productTotal);

      if (productTotal <= 0 || totalShares <= 0) continue;

      for (const consumer of validConsumers) {
        const share = Math.max(1, Number(consumer.share || 1));
        baseTotals[consumer.personId] = (baseTotals[consumer.personId] || 0) + productTotal * (share / totalShares);
      }
    }
  }

  for (const person of people) {
    const previousDebt = Math.max(0, Number(person.previousDebt || 0));
    if (previousDebt > 0) {
      baseTotals[person.id] = (baseTotals[person.id] || 0) + previousDebt;
      addToMap(categoryTotals, 'Deuda anterior', previousDebt);
    }
  }

  const subtotal = Object.values(baseTotals).reduce((sum, amount) => sum + amount, 0);
  const tipPercent = bill?.mode === 'home' ? 0 : Math.max(0, Number(bill?.tipPercent || 0));
  const tipAmount = subtotal * (tipPercent / 100);
  const finalTotals = {};
  let paidTotal = 0;
  let pendingTotal = 0;

  for (const person of people) {
    const personSubtotal = baseTotals[person.id] || 0;
    const finalAmount = personSubtotal + personSubtotal * (tipPercent / 100);
    finalTotals[person.id] = finalAmount;

    if (person.paid) {
      paidTotal += finalAmount;
    } else {
      pendingTotal += finalAmount;
    }
  }

  const paidPeople = people.filter((person) => person.paid).length;
  const grandTotal = subtotal + tipAmount;

  return {
    subtotal,
    tipAmount,
    grandTotal,
    paidTotal,
    pendingTotal,
    finalTotals,
    categoryTotals,
    paidPeople,
    totalPeople: people.length,
    isPaid: people.length > 0 && paidPeople === people.length,
  };
}

function getLatestRecurringBill(group, bills) {
  const ids = new Set(Array.isArray(group?.billIds) ? group.billIds : []);
  const groupBills = bills
    .filter((bill) => bill.recurringGroupId === group?.id || ids.has(bill.id))
    .sort((a, b) => String(getBillMonthLabel(a)).localeCompare(String(getBillMonthLabel(b))) || String(getBillDateValue(a)).localeCompare(String(getBillDateValue(b))));

  return groupBills.length ? groupBills[groupBills.length - 1] : null;
}


function calculateStats() {
  const bills = Array.isArray(state?.bills) ? state.bills : [];
  const recurringGroups = Array.isArray(state?.recurringGroups) ? state.recurringGroups : [];
  const matchKeys = getProfileMatchKeys();

  let historicalTotal = 0;
  let paidTotal = 0;
  let pendingTotal = 0;
  let peopleCount = 0;
  let productCount = 0;
  let homeBills = 0;
  let quickBills = 0;
  let outingBills = 0;
  let sharedBills = 0;
  let recurringMonths = 0;
  let recurringPending = 0;
  let carryoverTotal = 0;
  let paidBills = 0;
  let pendingBills = 0;
  let lastActivity = '';
  let myAssignedTotal = 0;
  let myPendingTotal = 0;
  let myPaidAsPayerTotal = 0;
  let myOwnShareAsPayer = 0;
  let myReceivableTotal = 0;

  const categories = new Map();
  const peopleFrequency = new Map();
  const peopleAmounts = new Map();
  const peoplePending = new Map();
  const myReceivablePeople = new Map();
  const uniquePeople = new Map();
  const monthlyTotals = new Map();
  const billSnapshots = [];

  for (const bill of bills) {
    const snapshot = calculateBillSnapshot(bill);
    const activity = getBillDateValue(bill);

    if (activity && (!lastActivity || activity > lastActivity)) {
      lastActivity = activity;
    }

    if (bill.mode === 'home') homeBills += 1;
    else if (bill.mode === 'quick') quickBills += 1;
    else outingBills += 1;

    if (bill.sharedAccountId) sharedBills += 1;
    if (bill.recurringGroupId) recurringMonths += 1;

    peopleCount += Array.isArray(bill.people) ? bill.people.length : 0;
    productCount += Array.isArray(bill.products) ? bill.products.length : 0;
    historicalTotal += snapshot.grandTotal;
    paidTotal += snapshot.paidTotal;
    pendingTotal += snapshot.pendingTotal;

    if (snapshot.isPaid) paidBills += 1;
    else if (snapshot.grandTotal > 0) pendingBills += 1;

    addToMap(monthlyTotals, getBillMonthLabel(bill), snapshot.grandTotal);

    for (const [category, amount] of snapshot.categoryTotals.entries()) {
      addToMap(categories, category, amount);
    }

    for (const person of bill.people || []) {
      const name = String(person.name || 'Persona').trim() || 'Persona';
      const personKey = normalizeTextKey(person.email || person.userId || name) || normalizeTextKey(name);
      const personAmount = Number(snapshot.finalTotals[person.id] || 0);
      const previousDebt = Math.max(0, Number(person.previousDebt || 0));

      uniquePeople.set(personKey, name);
      addToMap(peopleFrequency, name, 1);
      addToMap(peopleAmounts, name, personAmount);
      carryoverTotal += previousDebt;

      if (!person.paid && personAmount > 0) {
        addToMap(peoplePending, name, personAmount);
      }

      if (personMatchesProfile(person, matchKeys)) {
        myAssignedTotal += personAmount;
        if (!person.paid) myPendingTotal += personAmount;
      }
    }

    const payer = (bill.people || []).find((person) => person.id === bill.payerId);

    if (payer && personMatchesProfile(payer, matchKeys)) {
      const myShare = Number(snapshot.finalTotals[payer.id] || 0);
      myPaidAsPayerTotal += snapshot.grandTotal;
      myOwnShareAsPayer += myShare;

      for (const person of bill.people || []) {
        if (person.id === payer.id) continue;
        const amount = Number(snapshot.finalTotals[person.id] || 0);
        if (amount > 0 && !person.paid) {
          myReceivableTotal += amount;
          addToMap(myReceivablePeople, String(person.name || 'Persona').trim() || 'Persona', amount);
        }
      }
    }

    billSnapshots.push({
      bill,
      total: snapshot.grandTotal,
      pending: snapshot.pendingTotal,
      paid: snapshot.paidTotal,
      isPaid: snapshot.isPaid,
      peopleCount: Array.isArray(bill.people) ? bill.people.length : 0,
      productCount: Array.isArray(bill.products) ? bill.products.length : 0,
      month: getBillMonthLabel(bill),
      modeLabel: getBillModeLabel(bill.mode),
      activity,
    });
  }

  const latestRecurringSummaries = recurringGroups.map((group) => {
    const groupBills = bills.filter((bill) => bill.recurringGroupId === group.id || (group.billIds || []).includes(bill.id));
    const latestBill = getLatestRecurringBill(group, bills);
    const latestSnapshot = latestBill ? calculateBillSnapshot(latestBill) : null;
    if (latestSnapshot) recurringPending += latestSnapshot.pendingTotal;
    return {
      name: group.name || 'Cuenta recurrente',
      months: groupBills.length,
      pending: latestSnapshot ? latestSnapshot.pendingTotal : 0,
      latestMonth: latestBill ? getBillMonthLabel(latestBill) : 'Sin mes',
    };
  }).sort((a, b) => b.pending - a.pending || b.months - a.months).slice(0, 5);

  const topMonth = [...monthlyTotals.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];
  const biggestBill = [...billSnapshots].sort((a, b) => b.total - a.total)[0] || null;
  const mostPeopleBill = [...billSnapshots].sort((a, b) => b.peopleCount - a.peopleCount)[0] || null;
  const paidRate = bills.length ? Math.round((paidBills / bills.length) * 100) : 0;

  return {
    totalBills: bills.length,
    activeBills: bills.filter((bill) => !bill.archived).length,
    historicalTotal,
    averageBill: bills.length ? historicalTotal / bills.length : 0,
    paidTotal,
    pendingTotal,
    paidBills,
    pendingBills,
    paidRate,
    peopleCount,
    uniquePeopleCount: uniquePeople.size,
    productCount,
    homeBills,
    quickBills,
    outingBills,
    sharedBills,
    recurringGroupsCount: recurringGroups.length,
    recurringMonths,
    recurringPending,
    carryoverTotal,
    myAssignedTotal,
    myPendingTotal,
    myPaidAsPayerTotal,
    myOwnShareAsPayer,
    myReceivableTotal,
    topMonth,
    biggestBill,
    mostPeopleBill,
    lastActivity,
    categories: [...categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    people: [...peopleFrequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    peopleAmounts: [...peopleAmounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    peoplePending: [...peoplePending.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    myReceivablePeople: [...myReceivablePeople.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    monthlyTotals: [...monthlyTotals.entries()].filter(([label]) => label !== 'Sin mes').sort((a, b) => b[1] - a[1]).slice(0, 6),
    topBills: [...billSnapshots].sort((a, b) => b.total - a.total).slice(0, 5).map((item) => [item.bill.name || 'Cuenta sin nombre', item.total]),
    recurringSummaries: latestRecurringSummaries.map((item) => [item.name, `${item.months} mes${item.months === 1 ? '' : 'es'} · ${item.pending > 0 ? formatCurrency(item.pending) : 'Sin pendiente'}`]),
    recentActivity: [...billSnapshots]
      .sort((a, b) => String(b.activity || '').localeCompare(String(a.activity || '')))
      .slice(0, 6),
  };
}

function setText(node, value) {
  if (node) node.textContent = value;
}

function renderMiniRanking(container, rows, formatter = (value) => value) {
  if (!container) return;
  container.innerHTML = '';

  if (!rows?.length) {
    container.innerHTML = '<p class="helper-text">Sin datos todavía.</p>';
    return;
  }

  for (const [label, value] of rows) {
    const row = document.createElement('div');
    row.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(formatter(value))}</strong>`;
    container.appendChild(row);
  }
}

function renderInsightList(container, rows) {
  if (!container) return;
  container.innerHTML = '';

  if (!rows?.length) {
    container.innerHTML = '<p class="helper-text">Sin datos todavía.</p>';
    return;
  }

  for (const item of rows) {
    const row = document.createElement('div');
    row.className = 'profile-insight-row';
    row.innerHTML = `<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>${item.help ? `<small>${escapeHtml(item.help)}</small>` : ''}`;
    container.appendChild(row);
  }
}

function renderRecentActivity(container, rows) {
  if (!container) return;
  container.innerHTML = '';

  if (!rows?.length) {
    container.innerHTML = '<p class="helper-text">Sin actividad registrada.</p>';
    return;
  }

  for (const item of rows) {
    const row = document.createElement('div');
    row.className = 'profile-activity-row';
    const dateLabel = item.activity ? new Date(item.activity).toLocaleDateString('es-CL') : 'Sin fecha';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.bill.name || 'Cuenta sin nombre')}</strong>
        <span>${escapeHtml(item.modeLabel)} · ${escapeHtml(item.month)} · ${escapeHtml(dateLabel)}</span>
      </div>
      <strong>${escapeHtml(formatCurrency(item.total))}</strong>
    `;
    container.appendChild(row);
  }
}

function renderStats() {
  const stats = calculateStats();
  const topCategory = stats.categories[0];
  const topPerson = stats.people[0];
  const biggestBillLabel = stats.biggestBill ? `${stats.biggestBill.bill.name || 'Cuenta sin nombre'} · ${formatCurrency(stats.biggestBill.total)}` : 'Sin datos';
  const topMonthLabel = stats.topMonth[0] ? `${stats.topMonth[0]} · ${formatCurrency(stats.topMonth[1])}` : '-';

  setText(dom.statTotalBills, stats.totalBills);
  setText(dom.statActiveBills, stats.activeBills);
  setText(dom.statHistoricalTotal, formatCurrency(stats.historicalTotal));
  setText(dom.statAverageBill, formatCurrency(stats.averageBill));
  setText(dom.statPeopleCount, stats.peopleCount);
  setText(dom.statUniquePeopleCount, stats.uniquePeopleCount);
  setText(dom.statUniquePeopleMirror, stats.uniquePeopleCount);
  setText(dom.statProductCount, stats.productCount);
  setText(dom.statSharedBills, stats.sharedBills);
  setText(dom.statPaidRate, `${stats.paidRate}%`);
  setText(dom.statHomeBills, stats.homeBills);
  setText(dom.statOutingBills, stats.outingBills + stats.quickBills);
  setText(dom.statBiggestBill, stats.biggestBill ? formatCurrency(stats.biggestBill.total) : '$0');
  setText(dom.statTopMonth, stats.topMonth[0] || '-');
  setText(dom.statMyAssignedTotal, formatCurrency(stats.myAssignedTotal));
  setText(dom.statMyPendingTotal, formatCurrency(stats.myPendingTotal));
  setText(dom.statPaidBills, stats.paidBills);
  setText(dom.statPendingBills, stats.pendingBills);
  setText(dom.statPaidTotal, formatCurrency(stats.paidTotal));
  setText(dom.statPendingTotal, formatCurrency(stats.pendingTotal));
  setText(dom.statMyPaidAsPayerTotal, formatCurrency(stats.myPaidAsPayerTotal));
  setText(dom.statMyOwnShareAsPayer, formatCurrency(stats.myOwnShareAsPayer));
  setText(dom.statMyReceivableTotal, formatCurrency(stats.myReceivableTotal));
  setText(dom.statRecurringGroups, stats.recurringGroupsCount);
  setText(dom.statRecurringMonths, stats.recurringMonths);
  setText(dom.statRecurringPending, formatCurrency(stats.recurringPending));
  setText(dom.statCarryoverTotal, formatCurrency(stats.carryoverTotal));

  if (dom.lastActivity) {
    dom.lastActivity.textContent = stats.lastActivity
      ? new Date(stats.lastActivity).toLocaleString('es-CL')
      : 'Sin actividad registrada.';
  }

  renderMiniRanking(dom.topCategories, stats.categories, formatCurrency);
  renderMiniRanking(dom.topPeople, stats.people, (value) => `${value} ${value === 1 ? 'cuenta' : 'cuentas'}`);
  renderMiniRanking(dom.topPeopleAmounts, stats.peopleAmounts, formatCurrency);
  renderMiniRanking(dom.pendingPeople, stats.peoplePending, formatCurrency);
  renderMiniRanking(dom.myReceivablePeople, stats.myReceivablePeople, formatCurrency);
  renderMiniRanking(dom.topBills, stats.topBills, formatCurrency);
  renderMiniRanking(dom.monthlyTotals, stats.monthlyTotals, formatCurrency);
  renderMiniRanking(dom.recurringSummary, stats.recurringSummaries, (value) => value);

  renderInsightList(dom.quickInsights, [
    { label: 'Categoría principal', value: topCategory ? topCategory[0] : 'Sin datos', help: topCategory ? formatCurrency(topCategory[1]) : 'Agrega gastos para calcularla.' },
    { label: 'Persona frecuente', value: topPerson ? topPerson[0] : 'Sin datos', help: topPerson ? `${topPerson[1]} ${topPerson[1] === 1 ? 'cuenta' : 'cuentas'}` : 'Agrega personas para verla.' },
    { label: 'Cuenta más alta', value: stats.biggestBill ? stats.biggestBill.bill.name || 'Cuenta sin nombre' : 'Sin datos', help: stats.biggestBill ? formatCurrency(stats.biggestBill.total) : 'Sin cuentas con monto.' },
  ]);

  renderInsightList(dom.paymentSummary, [
    { label: 'Total pagado', value: formatCurrency(stats.paidTotal), help: `${stats.paidBills} cuenta${stats.paidBills === 1 ? '' : 's'} cerrada${stats.paidBills === 1 ? '' : 's'}.` },
    { label: 'Total pendiente', value: formatCurrency(stats.pendingTotal), help: `${stats.pendingBills} cuenta${stats.pendingBills === 1 ? '' : 's'} con saldo pendiente.` },
    { label: 'Cuando tú pagas', value: formatCurrency(stats.myPaidAsPayerTotal), help: `Tu parte en esas cuentas: ${formatCurrency(stats.myOwnShareAsPayer)}. Pendiente por recibir: ${formatCurrency(stats.myReceivableTotal)}.` },
    { label: 'Cierre de pagos', value: `${stats.paidRate}%`, help: 'Porcentaje de cuentas con todas las personas marcadas como pagadas.' },
  ]);

  renderRecentActivity(dom.recentActivity, stats.recentActivity);

  renderInsightList(dom.milestones, [
    { label: 'Mes más alto', value: topMonthLabel, help: 'Calculado con el total de las cuentas registradas por mes.' },
    { label: 'Mayor cuenta', value: biggestBillLabel, help: 'La cuenta con más monto administrado.' },
    { label: 'Más participantes', value: stats.mostPeopleBill ? `${stats.mostPeopleBill.bill.name || 'Cuenta sin nombre'} · ${stats.mostPeopleBill.peopleCount}` : 'Sin datos', help: 'Cuenta con más personas agregadas.' },
    { label: 'Compartidas', value: `${stats.sharedBills}`, help: 'Cuentas vinculadas a colaboración con otros usuarios.' },
  ]);
}


function getPublicProfilePayload() {
  const profile = state?.profile || {};
  const display = getDisplayName();

  return {
    id: currentUser.id,
    email: currentUser.email || '',
    nick: profile.nick || display,
    nombre: profile.name || currentUser.user_metadata?.nombre || display,
    telefono: normalizePhoneNumber(profile.phone || ''),
    avatar_data_url: profile.avatarDataUrl || '',
    allow_search: true,
    updated_at: nowIso(),
  };
}

async function savePublicProfile() {
  if (!currentUser || !state) {
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('public_profiles')
      .upsert(getPublicProfilePayload(), { onConflict: 'id' });

    if (error) {
      console.error(error);
      showToast('Perfil guardado, pero no se pudo actualizar búsqueda pública.');
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    showToast('No se pudo actualizar búsqueda pública.');
    return false;
  }
}


async function ensurePublicProfile() {
  if (!currentUser || !state) {
    return;
  }

  await savePublicProfile();
}


function renderSocialMessage(container, message) {
  container.innerHTML = `<p class="helper-text">${message}</p>`;
}

function normalizePublicName(profile) {
  return profile.nick || profile.nombre || profile.email || 'Usuario';
}

function renderUserCard(profile, options = {}) {
  const card = document.createElement('div');
  card.className = 'social-user-card';
  const name = normalizePublicName(profile);
  card.innerHTML = `
    <div class="friend-mini-avatar">${profile.avatar_data_url ? `<img src="${profile.avatar_data_url}" alt="" />` : getInitials(name)}</div>
    <div class="social-user-body">
      <strong>${name}</strong>
      <span>${profile.email || ''}</span>
      ${profile.telefono ? `<small>${formatPhoneForDisplay(profile.telefono)}</small>` : ''}
    </div>
    <div class="social-user-actions"></div>
  `;

  const actions = card.querySelector('.social-user-actions');

  if (options.actions) {
    for (const action of options.actions) {
      const button = document.createElement('button');
      button.className = action.className || 'btn btn-light btn-small';
      button.type = 'button';
      button.textContent = action.label;
      button.addEventListener('click', action.onClick);
      actions.appendChild(button);
    }
  }

  return card;
}

async function searchRegisteredUsers() {
  if (!currentUser) {
    return;
  }

  const query = dom.userSearchInput.value.trim();

  if (query.length < 2) {
    renderSocialMessage(dom.userSearchResults, 'Escribe al menos 2 caracteres para buscar.');
    return;
  }

  try {
    const safeQuery = query.replace(/[%_,]/g, '');
    const { data, error } = await supabaseClient
      .from('public_profiles')
      .select('id, email, nick, nombre, telefono, avatar_data_url')
      .or(`nick.ilike.%${safeQuery}%,nombre.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`)
      .neq('id', currentUser.id)
      .limit(20);

    if (error) {
      console.error(error);
      renderSocialMessage(dom.userSearchResults, 'No se pudo buscar usuarios. Verifica que ejecutaste el SQL social.');
      return;
    }

    dom.userSearchResults.innerHTML = '';

    if (!data?.length) {
      renderSocialMessage(dom.userSearchResults, 'No se encontraron usuarios.');
      return;
    }

    for (const profile of data) {
      const card = renderUserCard(profile, {
        actions: [
          {
            label: 'Agregar',
            className: 'btn btn-primary btn-small',
            onClick: () => sendFriendRequest(profile.id),
          },
        ],
      });
      dom.userSearchResults.appendChild(card);
    }
  } catch (error) {
    console.error(error);
    renderSocialMessage(dom.userSearchResults, 'No se pudo buscar usuarios.');
  }
}

async function sendFriendRequest(recipientId) {
  if (!currentUser || recipientId === currentUser.id) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('friend_requests')
      .insert({
        requester_id: currentUser.id,
        recipient_id: recipientId,
        status: 'pending',
      });

    if (error) {
      showToast(error.code === '23505' ? 'Ya existe una solicitud con ese usuario.' : 'No se pudo enviar la solicitud.');
      console.error(error);
      return;
    }

    showToast('Solicitud enviada.');
    await renderFriendRequests();
  } catch (error) {
    console.error(error);
    showToast('No se pudo enviar la solicitud.');
  }
}

async function updateFriendRequest(requestId, status) {
  try {
    const { error } = await supabaseClient
      .from('friend_requests')
      .update({ status, updated_at: nowIso() })
      .eq('id', requestId);

    if (error) {
      console.error(error);
      showToast('No se pudo actualizar la solicitud.');
      return;
    }

    showToast(status === 'accepted' ? 'Solicitud aceptada.' : 'Solicitud rechazada.');
    await renderFriendRequests();
  } catch (error) {
    console.error(error);
  }
}

async function loadPublicProfiles(ids) {
  const uniqueIds = [...new Set(ids)].filter(Boolean);

  if (!uniqueIds.length) {
    return new Map();
  }

  const { data, error } = await supabaseClient
    .from('public_profiles')
    .select('id, email, nick, nombre, telefono, avatar_data_url')
    .in('id', uniqueIds);

  if (error) {
    console.error(error);
    return new Map();
  }

  return new Map((data || []).map((profile) => [profile.id, profile]));
}

async function renderFriendRequests() {
  if (!currentUser || !dom.incomingRequestsList) {
    return;
  }

  try {
    const { data: requests, error } = await supabaseClient
      .from('friend_requests')
      .select('id, requester_id, recipient_id, status, created_at, updated_at')
      .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      const message = 'Ejecuta el archivo sql/02-supabase-social.sql para activar amigos entre usuarios.';
      renderSocialMessage(dom.incomingRequestsList, message);
      renderSocialMessage(dom.outgoingRequestsList, message);
      renderSocialMessage(dom.registeredFriendsList, message);
      return;
    }

    const allIds = [];
    for (const request of requests || []) {
      allIds.push(request.requester_id, request.recipient_id);
    }

    const profiles = await loadPublicProfiles(allIds);
    const incoming = (requests || []).filter((request) => request.recipient_id === currentUser.id && request.status === 'pending');
    const outgoing = (requests || []).filter((request) => request.requester_id === currentUser.id && request.status === 'pending');
    const accepted = (requests || []).filter((request) => request.status === 'accepted');

    dom.incomingRequestsCount.textContent = incoming.length;
    dom.outgoingRequestsCount.textContent = outgoing.length;
    dom.registeredFriendsCount.textContent = accepted.length;

    dom.incomingRequestsList.innerHTML = '';
    dom.outgoingRequestsList.innerHTML = '';
    dom.registeredFriendsList.innerHTML = '';

    if (!incoming.length) {
      renderSocialMessage(dom.incomingRequestsList, 'No tienes solicitudes recibidas.');
    } else {
      for (const request of incoming) {
        const profile = profiles.get(request.requester_id);
        if (!profile) continue;
        dom.incomingRequestsList.appendChild(renderUserCard(profile, {
          actions: [
            { label: 'Aceptar', className: 'btn btn-primary btn-small', onClick: () => updateFriendRequest(request.id, 'accepted') },
            { label: 'Rechazar', className: 'btn btn-danger-light btn-small', onClick: () => updateFriendRequest(request.id, 'rejected') },
          ],
        }));
      }
    }

    if (!outgoing.length) {
      renderSocialMessage(dom.outgoingRequestsList, 'No tienes solicitudes enviadas.');
    } else {
      for (const request of outgoing) {
        const profile = profiles.get(request.recipient_id);
        if (!profile) continue;
        dom.outgoingRequestsList.appendChild(renderUserCard(profile, {
          actions: [{ label: 'Pendiente', className: 'btn btn-light btn-small', onClick: () => {} }],
        }));
      }
    }

    if (!accepted.length) {
      renderSocialMessage(dom.registeredFriendsList, 'Todavía no tienes amigos registrados.');
    } else {
      for (const request of accepted) {
        const otherId = request.requester_id === currentUser.id ? request.recipient_id : request.requester_id;
        const profile = profiles.get(otherId);
        if (!profile) continue;
        dom.registeredFriendsList.appendChild(renderUserCard(profile));
      }
    }
  } catch (error) {
    console.error(error);
  }
}


function renderFriends() {
  const friends = normalizeFriends(state.friends || []);
  state.friends = friends;
  dom.friendsList.innerHTML = '';

  if (!friends.length) {
    dom.friendsList.innerHTML = '<p class="helper-text">Todavía no tienes amigos guardados.</p>';
    return;
  }

  for (const friend of friends) {
    const row = document.createElement('div');
    row.className = 'friend-card';
    row.innerHTML = `
      <div class="friend-avatar">${friend.avatarDataUrl ? `<img src="${friend.avatarDataUrl}" alt="" />` : getInitials(friend.name)}</div>
      <div class="friend-card-body">
        <strong>${friend.name}</strong>
        <span>${friend.phone ? formatPhoneForDisplay(friend.phone) : 'Sin teléfono'}${friend.email ? ` · ${friend.email}` : ''}</span>
        ${friend.notes ? `<small>${friend.notes}</small>` : ''}
      </div>
      <div class="friend-card-actions">
        <button class="btn btn-light btn-small" data-edit="${friend.id}" type="button">Editar</button>
        <button class="btn btn-danger-light btn-small" data-delete="${friend.id}" type="button">Eliminar</button>
      </div>
    `;

    row.querySelector('[data-edit]').addEventListener('click', () => editFriend(friend.id));
    row.querySelector('[data-delete]').addEventListener('click', () => deleteFriend(friend.id));
    dom.friendsList.appendChild(row);
  }
}

const PROFILE_STATS_PANELS = ['resumen', 'gastos', 'personas', 'pagos', 'actividad'];

function setStatsPanel(panelName = 'resumen') {
  activeStatsPanel = PROFILE_STATS_PANELS.includes(panelName) ? panelName : 'resumen';

  dom.statsPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.profileStatsPanel === activeStatsPanel);
  });

  dom.statsTabs.forEach((button) => {
    const isActive = button.dataset.profileStatsTab === activeStatsPanel;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
}

const PROFILE_SECTIONS = ['perfil', 'estadisticas', 'amigos', 'configuracion'];

function getSectionFromHash() {
  const value = String(location.hash || '').replace('#', '');
  return PROFILE_SECTIONS.includes(value) ? value : 'perfil';
}

function setPageProfileSection(sectionName = 'perfil', updateHash = true) {
  activeProfileSection = PROFILE_SECTIONS.includes(sectionName) ? sectionName : 'perfil';

  const isLogged = Boolean(currentUser && state);

  dom.sections.forEach((section) => {
    section.classList.toggle('hidden', !isLogged || section.id !== activeProfileSection);
  });

  dom.pageTabs.forEach((button) => {
    const isActive = button.dataset.pageProfileTab === activeProfileSection;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  if (updateHash && location.hash !== `#${activeProfileSection}`) {
    history.replaceState(null, '', `#${activeProfileSection}`);
  }
}

function render() {
  const isLogged = Boolean(currentUser && state);
  dom.loginRequiredCard.classList.toggle('hidden', isLogged);

  if (!isLogged) {
    dom.sections.forEach((section) => section.classList.add('hidden'));
    dom.title.textContent = 'Perfil no disponible';
    dom.subtitle.textContent = 'Inicia sesión desde Cuenta Clara para administrar tu perfil.';
    dom.pageAvatar.textContent = 'CC';
    return;
  }

  renderProfileForm();
  renderStats();
  setStatsPanel(activeStatsPanel);
  renderFriendRequests();
  renderFriends();
  setPageProfileSection(activeProfileSection, false);
}

function saveProfileFromForm() {
  state.profile = makeDefaultProfile({
    ...state.profile,
    nick: dom.nick.value,
    name: dom.name.value,
    phone: dom.phone.value,
    currency: dom.currency.value,
    themePreference: dom.themePreference.value,
    updatedAt: nowIso(),
  });

  saveState().then(savePublicProfile).then(render);
}

function resizeImageToDataUrl(file, maxSize = 420) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };

    image.src = url;
  });
}

async function handleAvatarChange() {
  const file = dom.avatarFile.files?.[0];

  if (!file) return;

  try {
    state.profile.avatarDataUrl = await resizeImageToDataUrl(file);
    state.profile.updatedAt = nowIso();
    await saveState();
    await savePublicProfile();
    render();
  } catch (error) {
    console.error(error);
    showToast('No se pudo cargar la foto.');
  }
}

function resetFriendForm() {
  editingFriendId = null;
  dom.friendName.value = '';
  dom.friendPhone.value = '';
  dom.friendEmail.value = '';
  dom.friendNotes.value = '';
  dom.cancelFriendEdit.classList.add('hidden');
}

function saveFriend(event) {
  event.preventDefault();

  const name = dom.friendName.value.trim();
  if (!name) {
    showToast('Ingresa el nombre del amigo.');
    return;
  }

  const friendData = {
    name,
    phone: normalizePhoneNumber(dom.friendPhone.value),
    email: dom.friendEmail.value.trim(),
    notes: dom.friendNotes.value.trim(),
    updatedAt: nowIso(),
  };

  state.friends = normalizeFriends(state.friends || []);

  if (editingFriendId) {
    const friend = state.friends.find((item) => item.id === editingFriendId);
    if (friend) Object.assign(friend, friendData);
  } else {
    state.friends.push({
      id: createId('friend'),
      ...friendData,
      avatarDataUrl: '',
      createdAt: nowIso(),
    });
  }

  resetFriendForm();
  saveState().then(render);
}

function editFriend(friendId) {
  const friend = state.friends.find((item) => item.id === friendId);
  if (!friend) return;

  editingFriendId = friend.id;
  dom.friendName.value = friend.name;
  dom.friendPhone.value = friend.phone ? formatPhoneForDisplay(friend.phone) : '';
  dom.friendEmail.value = friend.email || '';
  dom.friendNotes.value = friend.notes || '';
  dom.cancelFriendEdit.classList.remove('hidden');
  setPageProfileSection('amigos');
}

function deleteFriend(friendId) {
  const friend = state.friends.find((item) => item.id === friendId);
  if (!friend) return;

  if (!confirm(`¿Eliminar a ${friend.name} de tus amigos?`)) return;

  state.friends = state.friends.filter((item) => item.id !== friendId);
  saveState().then(render);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || localStorage.getItem('cuenta-clara-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset.theme = next;
  document.body.classList.toggle('dark', next === 'dark');
  localStorage.setItem('cuenta-clara-theme', next);

  if (dom.themeToggle) {
    dom.themeToggle.textContent = next === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }
}

function initTheme() {
  const saved = localStorage.getItem('cuenta-clara-theme') || 'light';

  document.documentElement.dataset.theme = saved;
  document.body.classList.toggle('dark', saved === 'dark');

  if (dom.themeToggle) {
    dom.themeToggle.textContent = saved === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }
}

activeProfileSection = getSectionFromHash();

dom.pageTabs.forEach((button) => {
  button.addEventListener('click', () => setPageProfileSection(button.dataset.pageProfileTab));
});

dom.statsTabs.forEach((button) => {
  button.addEventListener('click', () => setStatsPanel(button.dataset.profileStatsTab));
});

window.addEventListener('hashchange', () => {
  setPageProfileSection(getSectionFromHash(), false);
});

dom.save.addEventListener('click', saveProfileFromForm);
dom.sync.addEventListener('click', () => saveState().then(render));
dom.logout.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.href = 'index.html';
});
dom.themeToggle.addEventListener('click', toggleTheme);
dom.avatarFile.addEventListener('change', handleAvatarChange);
dom.removeAvatar.addEventListener('click', () => {
  if (!state) return;
  state.profile.avatarDataUrl = '';
  saveState().then(render);
});
dom.friendForm.addEventListener('submit', saveFriend);
dom.searchUsersButton.addEventListener('click', searchRegisteredUsers);
dom.userSearchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchRegisteredUsers();
  }
});
dom.cancelFriendEdit.addEventListener('click', resetFriendForm);

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    currentUser = null;
    state = null;
    render();
  }

  if (session?.user) {
    loadState();
  }
});

initTheme();
loadState();
