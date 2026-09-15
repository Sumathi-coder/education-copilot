// Temporary frontend data layer.
// This is intentionally the ONLY local persistence layer used by the app.
// When the backend is ready, service modules can be switched to HTTP without
// changing page components.

const PREFIX = 'educopilot_local_'

function key(name) {
  return `${PREFIX}${name}`
}

export function readStore(name, fallback) {
  try {
    const raw = localStorage.getItem(key(name))
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeStore(name, value) {
  localStorage.setItem(key(name), JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('educopilot:data-updated', { detail: { name, value } }))
  return value
}

export function removeStore(name) {
  localStorage.removeItem(key(name))
  window.dispatchEvent(new CustomEvent('educopilot:data-updated', { detail: { name, value: null } }))
}

export function subscribeStore(name, callback) {
  const handler = (event) => {
    if (event.detail?.name === name) callback(event.detail.value)
  }
  const storageHandler = (event) => {
    if (event.key === key(name)) callback(readStore(name, null))
  }
  window.addEventListener('educopilot:data-updated', handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener('educopilot:data-updated', handler)
    window.removeEventListener('storage', storageHandler)
  }
}
