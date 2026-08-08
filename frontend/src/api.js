// Thin API client. Paths are relative so the Vite dev proxy (vite.config.js)
// forwards them to the Flask backend on port 5000.

async function getJSON(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`)
  return res.json()
}

async function postJSON(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Flask aborts carry a human message in `description` (or `error`).
    throw new Error(data.description || data.error || data.message || `HTTP ${res.status}`)
  }
  return data
}

export const getItems = () => getJSON('/api/items')
export const getLibraries = () => getJSON('/api/libraries')
export const getCategories = () => getJSON('/api/categories')
export const getItemAvailability = (itemId, lib) =>
  getJSON(`/api/items/${itemId}/availability?lib=${encodeURIComponent(lib)}`)

// Reservations are scoped to a user's library card number.
export const getReservations = (user) => getJSON(`/api/reservations?user=${encodeURIComponent(user)}`)
export const createReservation = (payload) => postJSON('/api/reservations', payload)
export const cancelReservationApi = (code) => postJSON(`/api/reservations/${code}/cancel`)

// Auth
export const loginApi = (card_number, password) => postJSON('/api/login', { card_number, password })
export const registerApi = (payload) => postJSON('/api/register', payload)
