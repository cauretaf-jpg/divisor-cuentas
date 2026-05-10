(function () {
  'use strict';

  const THEME_KEY = 'cuenta-clara-theme';

  function nowIso() {
    return new Date().toISOString();
  }

  function createId(prefix = 'id') {
    const safePrefix = String(prefix || 'id').trim() || 'id';

    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `${safePrefix}_${window.crypto.randomUUID()}`;
    }

    return `${safePrefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizePhoneNumber(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    let digits = raw.replace(/\D/g, '');
    if (!digits) return '';

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

  function getUserStorageKey(identifier) {
    return `cuenta-clara-supabase-state:${String(identifier || '').trim()}`;
  }

  function makeDefaultProfile(input = {}, fallbackName = '') {
    const safe = input && typeof input === 'object' ? input : {};
    const nameFallback = String(fallbackName || '').trim();

    return {
      nick: String(safe.nick || safe.displayName || nameFallback || '').trim(),
      name: String(safe.name || nameFallback || '').trim(),
      phone: normalizePhoneNumber(safe.phone || ''),
      avatarDataUrl: String(safe.avatarDataUrl || safe.avatar || '').startsWith('data:image/') ? String(safe.avatarDataUrl || safe.avatar) : '',
      currency: safe.currency === 'CLP' ? 'CLP' : 'CLP',
      themePreference: ['system', 'light', 'dark'].includes(safe.themePreference) ? safe.themePreference : 'system',
      createdAt: safe.createdAt || nowIso(),
      updatedAt: safe.updatedAt || nowIso(),
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

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getBillModeLabel(mode) {
    if (mode === 'quick') return 'Rápida';
    if (mode === 'home') return 'Hogar';
    return 'Detallada';
  }

  function getBillModeLongLabel(mode) {
    if (mode === 'quick') return 'Cuenta rápida';
    if (mode === 'home') return 'Cuenta hogar';
    return 'Cuenta detallada';
  }

  function applyTheme(theme, toggleButton) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = safeTheme;
    document.body?.classList.toggle('dark', safeTheme === 'dark');

    if (toggleButton) {
      toggleButton.textContent = safeTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
  }

  function initTheme(toggleButton) {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme, toggleButton);
  }

  function toggleTheme(toggleButton) {
    const current = document.documentElement.dataset.theme || localStorage.getItem(THEME_KEY) || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next, toggleButton);
  }

  window.CuentaClaraUtils = Object.freeze({
    nowIso,
    createId,
    normalizePhoneNumber,
    formatPhoneForDisplay,
    formatCurrency,
    getInitials,
    getUserStorageKey,
    makeDefaultProfile,
    normalizeFriends,
    escapeHtml,
    getBillModeLabel,
    getBillModeLongLabel,
    initTheme,
    toggleTheme,
  });
})();
