// Thin API client. Paths are relative so the Vite dev proxy (vite.config.js)
// forwards them to the Flask backend on port 5000.

async function getJSON(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`)
  return res.json()
}

export const getItems = () => getJSON('/api/items')
export const getLibraries = () => getJSON('/api/libraries')
export const getCategories = () => getJSON('/api/categories')
