import { useApp } from '../AppContext'
import { thumbBg, monogram, formatDate, loanLabel, todayISO } from '../helpers'

export default function MyReservations() {
  const { reservations, libraries, user, go, openItem, cancelingCode, setCancelingCode, cancelReservation } = useApp()
  const today = todayISO()

  // Split into lifecycle buckets. An active loan that has started (pickup on or
  // before today) is "currently borrowed"; one starting later is "upcoming".
  const cancelled = reservations.filter((r) => r.status === 'cancelled')
  const active = reservations.filter((r) => r.status !== 'cancelled')
  const current = active.filter((r) => r.date <= today)
  const upcoming = active.filter((r) => r.date > today)
  const hasAny = reservations.length > 0

  const Thumb = ({ item }) => (
    <div className="em" style={{ background: thumbBg(item.category), padding: 8, borderRadius: 12 }}>
      <span className="mono-thumb sm">{monogram(item.name)}</span>
    </div>
  )

  const returnText = (r) =>
    r.days === 0 ? formatDate(r.date) + ' (same day)' : formatDate(r.returnBy)

  const ActiveCard = ({ r, badge }) => {
    const l = libraries[r.lib]
    const confirming = cancelingCode === r.code
    return (
      <div className={'resv-card' + (confirming ? ' confirming' : '')}>
        <Thumb item={r.item} />
        <div className="info">
          <button className="nm nm-link" onClick={() => openItem(r.item.id)}>
            {r.item.name}
          </button>
          <div className="mt">
            {l.name} · pickup {formatDate(r.date)}
          </div>
          <div className="mt">
            {loanLabel(r.days)} loan · return by {returnText(r)}
          </div>
        </div>
        {confirming ? (
          <div className="cancel-confirm">
            <span className="cc-q">Cancel this reservation?</span>
            <button className="btn btn-sm btn-keep" onClick={() => setCancelingCode(null)}>
              Keep
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => cancelReservation(r.code)}>
              Yes, cancel
            </button>
          </div>
        ) : (
          <div className="resv-right">
            <div className="rc">{r.code}</div>
            {badge}
            <button className="link-cancel" onClick={() => setCancelingCode(r.code)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  const Section = ({ title, children }) => (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 20 }}>{title}</h2>
      </div>
      <div className="resv-list">{children}</div>
    </>
  )

  return (
    <div className="screen active" id="reservations">
      <div className="wrap resv">
        <h1>My reservations</h1>
        <p className="sub">Signed in as {user.name} · card {user.card_number}</p>

        {!hasAny ? (
          <div className="empty">
            <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--text)' }}>No reservations yet</p>
            <p>Find something you need and reserve it. It'll show up here.</p>
            <button className="btn" style={{ marginTop: 16 }} onClick={() => go('home')}>
              Start searching
            </button>
          </div>
        ) : (
          <>
            {current.length > 0 && (
              <Section title="Currently borrowed">
                {current.map((r) => (
                  <ActiveCard
                    key={r.code}
                    r={r}
                    badge={
                      <div className="badge b-warn" style={{ marginTop: 6 }}>
                        <span className="dot" />
                        Borrowed
                      </div>
                    }
                  />
                ))}
              </Section>
            )}

            {upcoming.length > 0 && (
              <Section title="Upcoming">
                {upcoming.map((r) => (
                  <ActiveCard
                    key={r.code}
                    r={r}
                    badge={
                      <div className="badge b-ok" style={{ marginTop: 6 }}>
                        <span className="dot" />
                        Reserved
                      </div>
                    }
                  />
                ))}
              </Section>
            )}

            {cancelled.length > 0 && (
              <Section title="Past & cancelled">
                {cancelled.map((r) => {
                  const l = libraries[r.lib]
                  return (
                    <div key={r.code} className="resv-card" style={{ opacity: 0.7 }}>
                      <Thumb item={r.item} />
                      <div className="info">
                        <button className="nm nm-link" onClick={() => openItem(r.item.id)}>
                          {r.item.name}
                        </button>
                        <div className="mt">
                          {l.name} · was for {formatDate(r.date)}
                        </div>
                      </div>
                      <div className="resv-right">
                        <div className="badge b-out">Cancelled</div>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ marginTop: 8 }}
                          onClick={() => openItem(r.item.id)}
                        >
                          Reserve again
                        </button>
                      </div>
                    </div>
                  )
                })}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
