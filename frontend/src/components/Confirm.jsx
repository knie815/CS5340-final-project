import { useApp } from '../AppContext'
import { thumbBg, monogram } from '../helpers'

export default function Confirm() {
  const { lastReservation: resv, libraries, go, user } = useApp()
  if (!resv) return null
  const item = resv.item
  const l = libraries[resv.lib]

  return (
    <div className="screen active" id="confirm">
      <div className="wrap flow">
        <div className="confirm-hero">
          <h1>You're all set, {user.name.split(' ')[0]}!</h1>
          <p>
            {item.name} is reserved at {l.name}. Show this code at the desk to pick it up.
          </p>
        </div>
        <div className="ticket">
          <div className="ticket-top">
            <div className="em" style={{ background: thumbBg(item.category), padding: 12, borderRadius: 12 }}>
              <span className="mono-thumb sm">{monogram(item.name)}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 19 }}>{item.name}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 3 }}>{item.fee}</div>
            </div>
          </div>
          <div className="ticket-code">
            <div>
              <div className="lbl">Reservation code</div>
              <div className="code">{resv.code}</div>
            </div>
          </div>
          <div className="ticket-info">
            <div>
              <div className="k">Pickup library</div>
              <div className="v">{l.name}</div>
            </div>
            <div>
              <div className="k">Pickup date</div>
              <div className="v">{resv.date}</div>
            </div>
            <div>
              <div className="k">Loan length</div>
              <div className="v">{resv.days + (resv.days === 1 ? ' day' : ' days')}</div>
            </div>
            <div>
              <div className="k">Return by</div>
              <div className="v">{resv.returnBy}</div>
            </div>
          </div>
        </div>
        <div className="flow-actions" style={{ justifyContent: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => go('home')}>
            Search for more
          </button>
          <button className="btn" onClick={() => go('reservations')}>
            View my reservations
          </button>
        </div>
      </div>
    </div>
  )
}
