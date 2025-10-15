// === Persistencia: utilidades ===
function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

export function loadFromStorage(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  const raw = window.localStorage.getItem(key);
  return raw == null ? defaultValue : safeParse(raw, defaultValue);
}

export function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
