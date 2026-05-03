console.info('Cuenta Clara Perfil V9.0 cargado');

const GUEST_STORAGE_KEY = 'cuenta-clara-v1-state';
let currentUser = null;
let state = null;
let editingFriendId = null;
let activeProfileSection = 'perfil';

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
  statProductCount: document.querySelector('#pageStatProductCount'),
  statHomeBills: document.querySelector('#pageStatHomeBills'),
  statOutingBills: document.querySelector('#pageStatOutingBills'),
  topCategories: document.querySelector('#pageTopCategories'),
  topPeople: document.querySelector('#pageTopPeople'),
  lastActivity: document.querySelector('#pageLastActivity'),
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

function calculateStats() {
  const bills = Array.isArray(state.bills) ? state.bills : [];
  let historicalTotal = 0;
  let peopleCount = 0;
  let productCount = 0;
  let homeBills = 0;
  let outingBills = 0;
  let lastActivity = '';

  const categories = new Map();
  const people = new Map();

  for (const bill of bills) {
    if (bill.mode === 'home') homeBills += 1;
    if (bill.mode !== 'home') outingBills += 1;
    peopleCount += Array.isArray(bill.people) ? bill.people.length : 0;

    if (bill.updatedAt && (!lastActivity || bill.updatedAt > lastActivity)) {
      lastActivity = bill.updatedAt;
    }

    for (const person of bill.people || []) {
      people.set(person.name, (people.get(person.name) || 0) + 1);
    }

    for (const product of bill.products || []) {
      productCount += 1;
      const amount = (Number(product.unitPrice) || 0) * (Number(product.quantity) || 1);
      historicalTotal += amount;
      const category = product.category || 'Otros';
      categories.set(category, (categories.get(category) || 0) + amount);
    }

    if (bill.mode === 'quick') {
      historicalTotal += Number(bill.quickTotal) || 0;
    }
  }

  return {
    totalBills: bills.length,
    activeBills: bills.filter((bill) => !bill.archived).length,
    historicalTotal,
    averageBill: bills.length ? historicalTotal / bills.length : 0,
    peopleCount,
    productCount,
    homeBills,
    outingBills,
    lastActivity,
    categories: [...categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    people: [...people.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

function renderMiniRanking(container, rows, formatter = (value) => value) {
  container.innerHTML = '';

  if (!rows.length) {
    container.innerHTML = '<p class="helper-text">Sin datos todavía.</p>';
    return;
  }

  for (const [label, value] of rows) {
    const row = document.createElement('div');
    row.innerHTML = `<span>${label}</span><strong>${formatter(value)}</strong>`;
    container.appendChild(row);
  }
}

function renderStats() {
  const stats = calculateStats();

  dom.statTotalBills.textContent = stats.totalBills;
  dom.statActiveBills.textContent = stats.activeBills;
  dom.statHistoricalTotal.textContent = formatCurrency(stats.historicalTotal);
  dom.statAverageBill.textContent = formatCurrency(stats.averageBill);
  dom.statPeopleCount.textContent = stats.peopleCount;
  dom.statProductCount.textContent = stats.productCount;
  dom.statHomeBills.textContent = stats.homeBills;
  dom.statOutingBills.textContent = stats.outingBills;
  dom.lastActivity.textContent = stats.lastActivity
    ? new Date(stats.lastActivity).toLocaleString('es-CL')
    : 'Sin actividad registrada.';

  renderMiniRanking(dom.topCategories, stats.categories, formatCurrency);
  renderMiniRanking(dom.topPeople, stats.people, (value) => `${value} ${value === 1 ? 'vez' : 'veces'}`);
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
