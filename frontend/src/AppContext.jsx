import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getItems, getLibraries, getCategories } from './api'
import { returnDateStr } from './helpers'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const USER = { name: 'Katherine Nie', initials: 'KN', email: 'katherine.nie@xxxxx.com' }

export function AppProvider({ children }) {
  // ---- API data ----
  const [items, setItems] = useState([])
  const [libraries, setLibraries] = useState({})
  const [categories, setCategories] = useState([])
  const [dataStatus, setDataStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    Promise.all([getItems(), getLibraries(), getCategories()])
      .then(([i, l, c]) => {
        setItems(i)
        setLibraries(l)
        setCategories(c)
        setDataStatus('ready')
      })
      .catch(() => setDataStatus('error'))
  }, [])

  // ---- navigation ----
  const [screen, setScreen] = useState('home')
  const [cancelingCode, setCancelingCode] = useState(null)
  const go = useCallback((s) => {
    setScreen(s)
    setCancelingCode(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // ---- toast ----
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastShow(true)
    clearTimeout(toast._t)
    toast._t = setTimeout(() => setToastShow(false), 2200)
  }, [])

  // ---- auth (mocked) ----
  const [authed, setAuthed] = useState(false)
  const [afterAuth, setAfterAuth] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const requireAuth = useCallback(
    (action) => {
      if (authed) {
        action()
        return
      }
      setAfterAuth(() => action)
      go('signin')
    },
    [authed, go]
  )
  const signIn = useCallback(
    (msg) => {
      setAuthed(true)
      if (msg) toast(msg)
      const next = afterAuth
      setAfterAuth(null)
      if (next) next()
      else go('home')
    },
    [afterAuth, go, toast]
  )
  const logOut = useCallback(() => {
    setAuthed(false)
    setAfterAuth(null)
    setMenuOpen(false)
    toast('Signed out')
    go('home')
  }, [go, toast])

  // ---- search / filter state ----
  const [query, setQuery] = useState('')
  const [filterCat, setFilterCat] = useState(null)
  const [filterLib, setFilterLib] = useState([])
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [maxDist, setMaxDist] = useState(10)

  const search = useCallback(
    (q) => {
      setQuery(q)
      setFilterCat(null)
      setFilterLib([])
      go('results')
    },
    [go]
  )

  // ---- item detail + reserve flow ----
  const [currentItem, setCurrentItem] = useState(null)
  const [reserve, setReserve] = useState({ lib: null, date: null, step: 1, reminders: true, days: null })

  const openItem = useCallback(
    (id) => {
      const item = items.find((i) => i.id === id)
      setCurrentItem(item)
      const inStock = item.avail.filter((a) => a.count > 0)
      setReserve({ lib: inStock.length ? inStock[0].lib : null, date: null, step: 1, reminders: true, days: null })
      go('item')
    },
    [items, go]
  )

  // ---- reservations (in-memory until SQLite) ----
  const [reservations, setReservations] = useState([])
  const [lastReservation, setLastReservation] = useState(null)

  const confirmReservation = useCallback(() => {
    const item = currentItem
    const r = reserve
    const code = 'BI-' + item.id.slice(0, 3).toUpperCase() + '-' + (1000 + ((reservations.length * 137) % 8999))
    const days = r.days || item.maxLoan
    const resv = {
      code,
      item,
      lib: r.lib,
      date: r.date,
      days,
      returnBy: returnDateStr(r.date, days),
      reminders: r.reminders,
    }
    setReservations((prev) => [resv, ...prev])
    setLastReservation(resv)
    go('confirm')
  }, [currentItem, reserve, reservations.length, go])

  const cancelReservation = useCallback(
    (code) => {
      setReservations((prev) => prev.filter((r) => r.code !== code))
      setCancelingCode(null)
      toast('Reservation cancelled')
    },
    [toast]
  )

  const value = {
    items, libraries, categories, dataStatus,
    screen, go,
    toastMsg, toastShow, toast,
    authed, menuOpen, setMenuOpen, requireAuth, signIn, logOut,
    query, setQuery, filterCat, setFilterCat, filterLib, setFilterLib,
    onlyAvailable, setOnlyAvailable, maxDist, setMaxDist, search,
    currentItem, openItem, reserve, setReserve,
    reservations, lastReservation, confirmReservation,
    cancelingCode, setCancelingCode, cancelReservation,
    user: USER,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
