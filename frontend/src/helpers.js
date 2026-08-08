// Availability + presentation helpers, ported from the prototype.
// These are pure functions: anything that depended on the prototype's global
// `state` or `LIBRARIES` now takes those values as explicit arguments.

export function totalCount(item) {
  return item.avail.reduce((s, a) => s + a.count, 0)
}

export function libsInStock(item) {
  return item.avail.filter((a) => a.count > 0)
}

export function statusOf(item) {
  const t = totalCount(item)
  if (t === 0) return { cls: 'b-out', txt: 'Checked out' }
  if (t <= 2) return { cls: 'b-warn', txt: t + ' left nearby' }
  return { cls: 'b-ok', txt: 'In stock' }
}

export function nearestDist(item, libraries) {
  const inStock = libsInStock(item)
  const pool = inStock.length ? inStock : item.avail
  return Math.min(...pool.map((a) => libraries[a.lib].dist))
}

// Availability entries relevant to the active location filter (all libs if none selected).
export function candidateAvail(item, filterLib) {
  return filterLib.length ? item.avail.filter((a) => filterLib.includes(a.lib)) : item.avail
}

// Nearest distance among a set of availability entries (in-stock first, else any).
export function nearestDistOf(avail, libraries) {
  const inStock = avail.filter((a) => a.count > 0)
  const pool = inStock.length ? inStock : avail
  return pool.length ? Math.min(...pool.map((a) => libraries[a.lib].dist)) : Infinity
}

// Loan duration options up to an item's max (in days).
export function loanOptions(maxLoan) {
  const opts = [1, 2, 3, 5, 7, 10, 14].filter((d) => d <= maxLoan)
  if (!opts.includes(maxLoan)) opts.push(maxLoan)
  return opts
}

// ---- Real calendar dates (fixes the past-date / no-year / invalid-date bugs) ----

const pad = (n) => String(n).padStart(2, '0')
export function isoOf(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// The next `count` calendar days starting tomorrow, as pickup options.
export function upcomingDates(count = 5) {
  const out = []
  const base = new Date()
  for (let i = 1; i <= count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      iso: isoOf(d),
      dow: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      day: String(d.getDate()),
    })
  }
  return out
}

// ISO yyyy-mm-dd + N days -> ISO yyyy-mm-dd (real calendar arithmetic).
export function addDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return isoOf(d)
}

// ISO yyyy-mm-dd -> "Thu, Jul 10, 2026". Falls back to the raw value if unparseable.
export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function todayISO() {
  return isoOf(new Date())
}

// Whole days from ISO date a to ISO date b (b - a).
export function diffDaysISO(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000)
}

// A calendar month laid out as flat cells (leading/trailing blanks are null).
// monthIndex is 0-based (0 = January).
export function monthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoOf(new Date(year, monthIndex, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function monthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Human loan-length label. 0 days = a same-day (day-use) loan.
export function loanLabel(days) {
  if (days === 0) return 'Same-day'
  return days + (days === 1 ? ' day' : ' days')
}

const THUMB_BG = {
  office: '#EAF0EE',
  home: '#EFEAE0',
  craft: '#F0E7EE',
  electronics: '#E7EDF2',
  tools: '#F0ECDF',
  outdoors: '#E6F0E8',
}
export function thumbBg(cat) {
  return THUMB_BG[cat] || '#EEEAE0'
}

export function monogram(name) {
  const w = name.replace(/[^A-Za-z ]/g, '').trim().split(/\s+/)
  return (w[0][0] + (w[1] ? w[1][0] : '')).toUpperCase()
}

// The prototype's filteredItems(), now taking items + filter state + libraries.
// filters.sortBy: 'distance' (default) | 'availability'.
export function filteredItems(items, filters, libraries) {
  const { query, filterCat, filterLib, onlyAvailable, maxDist, sortBy } = filters
  let list = items.slice()
  const q = query.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.cat.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q)
    )
  }
  if (filterCat) list = list.filter((i) => i.category === filterCat)
  if (filterLib.length) list = list.filter((i) => candidateAvail(i, filterLib).some((a) => a.count > 0))
  if (onlyAvailable) list = list.filter((i) => candidateAvail(i, filterLib).some((a) => a.count > 0))
  list = list.filter((i) => nearestDistOf(candidateAvail(i, filterLib), libraries) <= maxDist)

  const distanceOf = (i) => nearestDistOf(candidateAvail(i, filterLib), libraries)
  const availOf = (i) => candidateAvail(i, filterLib).reduce((s, a) => s + a.count, 0)

  if (sortBy === 'availability') {
    list.sort((a, b) => availOf(b) - availOf(a) || distanceOf(a) - distanceOf(b))
  } else {
    list.sort((a, b) => distanceOf(a) - distanceOf(b))
  }
  return list
}
