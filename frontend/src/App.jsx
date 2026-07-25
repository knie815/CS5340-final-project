import { useEffect } from 'react'
import './App.css'
import { useApp } from './AppContext'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import SignIn from './components/SignIn'
import Home from './components/Home'
import Results from './components/Results'
import ItemDetail from './components/ItemDetail'
import Reserve from './components/Reserve'
import Confirm from './components/Confirm'
import MyReservations from './components/MyReservations'

const SCREENS = {
  home: Home,
  results: Results,
  item: ItemDetail,
  reserve: Reserve,
  confirm: Confirm,
  reservations: MyReservations,
}

function Toast() {
  const { toastMsg, toastShow } = useApp()
  return <div className={'toast' + (toastShow ? ' show' : '')}>{toastMsg}</div>
}

export default function App() {
  const { dataStatus, screen, menuOpen, setMenuOpen } = useApp()

  // Close the user menu on any outside click (matches the prototype).
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen, setMenuOpen])

  if (dataStatus === 'loading') {
    return <div className="empty" style={{ paddingTop: 120 }}>Loading catalog…</div>
  }
  if (dataStatus === 'error') {
    return (
      <div className="empty" style={{ paddingTop: 120 }}>
        <p style={{ fontWeight: 600, color: 'var(--out)' }}>Could not reach the API.</p>
        <p>Is the Flask backend running on port 5000?</p>
      </div>
    )
  }

  if (screen === 'signin') {
    return (
      <>
        <SignIn />
        <Toast />
      </>
    )
  }

  const Screen = SCREENS[screen] || Home
  return (
    <>
      <TopBar />
      <Screen />
      <Footer />
      <Toast />
    </>
  )
}
