import { useApp } from '../AppContext'
import { thumbBg, monogram } from '../helpers'

export default function MyReservations() {
  const { reservations, libraries, user, go, cancelingCode, setCancelingCode, cancelReservation } = useApp()

  return (
    <div className="screen active" id="reservations">
      <div className="wrap resv">
        <h1>My reservations</h1>
        <p className="sub">Signed in as {user.email}</p>
        {reservations.length ? (
          <div className="resv-list">
            {reservations.map((r) => {
              const l = libraries[r.lib]
              const confirming = cancelingCode === r.code
              return (
                <div key={r.code} className={'resv-card' + (confirming ? ' confirming' : '')}>
                  <div className="em" style={{ background: thumbBg(r.item.category), padding: 8, borderRadius: 12 }}>
                    <span className="mono-thumb sm">{monogram(r.item.name)}</span>
                  </div>
                  <div className="info">
                    <div className="nm">{r.item.name}</div>
                    <div className="mt">
                      {l.name} · pickup {r.date}
                    </div>
                    <div className="mt">
                      {r.days + (r.days === 1 ? ' day' : ' days')} loan · return by {r.returnBy}
                    </div>
                  </div>
                  {confirming ? (
                    <div className="cancel-confirm">
                      <span className="cc-q">Cancel this reservation?</span>
                      <button className="btn btn-sm btn-ghost" onClick={() => cancelReservation(r.code)}>
                        Yes, cancel
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setCancelingCode(null)}>
                        Keep
                      </button>
                    </div>
                  ) : (
                    <div className="resv-right">
                      <div className="rc">{r.code}</div>
                      <div className="badge b-ok" style={{ marginTop: 6 }}>
                        <span className="dot" />
                        Reserved
                      </div>
                      <button className="link-cancel" onClick={() => setCancelingCode(r.code)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty">
            <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--text)' }}>No reservations yet</p>
            <p>Find something you need and reserve it. It'll show up here.</p>
            <button className="btn" style={{ marginTop: 16 }} onClick={() => go('home')}>
              Start searching
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
