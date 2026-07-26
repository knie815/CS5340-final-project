import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  getItems, getLibraries, getCategories, getReservations,
  createReservation, cancelReservationApi, notifyRequest,
} from './api'
import { diffDaysISO } from './helpers'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const USER = { name: 'Katherine Nie', initials: 'KN', email: 'katherine.nie@example.com' }

export function AppProvider({ children }) {
  // ---- API data ----
  const [items, setItems] = useState([])
  const [libraries, setLibraries] = useState({})
  const [categories, setCategories] = useState([])
  const [reservations, setReservations] = useState([])
  const [dataStatus, setDataStatus] = useState('loading') // loading | ready | error

  const refreshItems = useCallback(() => getItems().then(setItems), [])
  const refreshReservations = useCallback(() => getReservations().then(setReservations), [])

  useEffect(() => {
    Promise.all([getItems(), getLibraries(), getCategories(), getReservations()])
      .then(([i, l, c, r]) => {
        setItems(i)
        setLibraries(l)
        setCategories(c)
        setReservations(r)
        setDataStatus('ready')
      })
      .catch(() => setDataStatus('error'))
  }, [])

  // ---- navigation (synced with the browser History API for back/forward) ----
  const [screen, setScreen] = useState('home')
  const [cancelingCode, setCancelingCode] = useState(null)
  // Which item the detail/reserve screens are showing. A ref mirrors the state so
  // go()/history can read it synchronously when pushing an entry.
  const [currentItemId, setCurrentItemId] = useState(null)
  const currentItemIdRef = useRef(null)
  const setItemId = useCallback((id) => {
    currentItemIdRef.current = id
    setCurrentItemId(id)
  }, [])

  // Apply a screen change without touching history (used by go() and popstate).
  const applyScreen = useCallback((s) => {
    setScreen(s)
    setCancelingCode(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const go = useCallback(
    (s) => {
      applyScreen(s)
      window.history.pushState({ screen: s, itemId: currentItemIdRef.current }, '')
    },
    [applyScreen]
  )

  // Seed the initial entry and respond to browser back/forward.
  useEffect(() => {
    window.history.replaceState({ screen: 'home', itemId: null }, '')
    const onPop = (e) => {
      const st = e.state || { screen: 'home', itemId: null }
      if (st.itemId) setItemId(st.itemId)
      applyScreen(st.screen || 'home')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [applyScreen, setItemId])

  // ---- toast ----
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastShow(true)
    clearTimeout(toast._t)
    toast._t = setTimeout(() => setToastShow(false), 2400)
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
      toast(msg || 'Signed in')
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

  // Jump to results filtered to a single library (clickable "Libraries near you").
  const browseLibrary = useCallback(
    (key) => {
      setQuery('')
      setFilterCat(null)
      setFilterLib([key])
      go('results')
    },
    [go]
  )

  // ---- item detail + reserve flow ----
  // currentItemId is declared with the navigation state above; derive the object
  // from the live items list so availability stays current after a refetch.
  const currentItem = useMemo(
    () => items.find((i) => i.id === currentItemId) || null,
    [items, currentItemId]
  )
  const [reserve, setReserve] = useState({ lib: null, start: null, end: null, step: 1, reminders: true })

  // Prefer a library that carries the item (capacity > 0), favouring one with
  // copies free today. Future dates are still reservable at booked-today libs.
  const pickDefaultLib = (item) => {
    if (!item) return null
    const carried = item.avail.filter((a) => a.capacity > 0)
    const freeToday = carried.find((a) => a.count > 0)
    return (freeToday || carried[0])?.lib || null
  }

  const openItem = useCallback(
    (id) => {
      const item = items.find((i) => i.id === id)
      setItemId(id)
      setReserve({ lib: pickDefaultLib(item), start: null, end: null, step: 1, reminders: true })
      go('item')
    },
    [items, go, setItemId]
  )

  // ---- reservations (persisted in SQLite via the API) ----
  const [lastReservation, setLastReservation] = useState(null)

  const confirmReservation = useCallback(async () => {
    const item = currentItem
    if (!item || !reserve.start || !reserve.end) return
    try {
      const resv = await createReservation({
        item_id: item.id,
        lib: reserve.lib,
        pickup_date: reserve.start, // ISO yyyy-mm-dd
        days: diffDaysISO(reserve.start, reserve.end),
        reminders: reserve.reminders,
      })
      setLastReservation(resv)
      await Promise.all([refreshItems(), refreshReservations()])
      go('confirm')
    } catch (err) {
      toast(err.message || 'Could not complete reservation')
    }
  }, [currentItem, reserve, refreshItems, refreshReservations, go, toast])

  const cancelReservation = useCallback(
    async (code) => {
      try {
        await cancelReservationApi(code)
        await Promise.all([refreshItems(), refreshReservations()])
        setCancelingCode(null)
        toast('Reservation cancelled')
      } catch (err) {
        toast(err.message || 'Could not cancel reservation')
      }
    },
    [refreshItems, refreshReservations, toast]
  )

  const notify = useCallback(
    async (itemId, lib) => {
      try {
        await notifyRequest({ item_id: itemId, lib, email: USER.email })
        const libName = libraries[lib]?.name || 'that library'
        toast(`We'll email you when it's back at ${libName}`)
      } catch (err) {
        toast(err.message || 'Could not set up notification')
      }
    },
    [libraries, toast]
  )

  const value = {
    items, libraries, categories, dataStatus,
    screen, go,
    toastMsg, toastShow, toast,
    authed, menuOpen, setMenuOpen, requireAuth, signIn, logOut,
    query, setQuery, filterCat, setFilterCat, filterLib, setFilterLib,
    onlyAvailable, setOnlyAvailable, maxDist, setMaxDist, search, browseLibrary,
    currentItem, openItem, reserve, setReserve,
    reservations, lastReservation, confirmReservation,
    cancelingCode, setCancelingCode, cancelReservation, notify,
    user: USER,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
