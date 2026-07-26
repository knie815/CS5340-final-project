import { useApp } from '../AppContext'

export default function TopBar() {
  const { query, search, authed, go, reservations, menuOpen, setMenuOpen, user, logOut } = useApp()

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand" onClick={() => go('home')}>
          <div className="brand-mark">B</div>
          <div className="brand-name">
            Borrow<b>It</b>
          </div>
        </div>
        <div className="topbar-search">
          <input
            type="text"
            placeholder="Search for a tool, appliance, or item…"
            defaultValue={query}
            onKeyDown={(e) => {
              if (e.key === 'Enter') search(e.target.value)
            }}
          />
        </div>
        <div className="topbar-actions">
          {authed && (
            <button className="nav-btn" onClick={() => go('reservations')}>
              {'Reservations' + (reservations.length ? ' (' + reservations.length + ')' : '')}
            </button>
          )}
          {authed ? (
            <div className="user-menu">
              <button
                className="avatar"
                title={user.email}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
              >
                {user.initials}
              </button>
              {menuOpen && (
                <div className="menu">
                  <div className="menu-head">
                    <div className="menu-name">{user.name}</div>
                    <div className="menu-email">{user.email}</div>
                  </div>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setMenuOpen(false)
                      go('reservations')
                    }}
                  >
                    My reservations
                  </button>
                  <button className="menu-item" onClick={() => logOut()}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-btn primary" onClick={() => go('signin')}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
