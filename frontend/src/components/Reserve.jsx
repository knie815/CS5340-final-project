import { useApp } from '../AppContext'
import { libsInStock, loanOptions, returnDateStr, thumbBg, monogram } from '../helpers'

const DATES = [
  { d: 'THU', n: '10', full: 'Thu, Jul 10' },
  { d: 'FRI', n: '11', full: 'Fri, Jul 11' },
  { d: 'SAT', n: '12', full: 'Sat, Jul 12' },
  { d: 'MON', n: '14', full: 'Mon, Jul 14' },
  { d: 'TUE', n: '15', full: 'Tue, Jul 15' },
]

export default function Reserve() {
  const { currentItem: item, libraries, reserve: r, setReserve, confirmReservation, go, user } = useApp()
  if (!item) return null

  const chosenDays = r.days == null || r.days > item.maxLoan ? item.maxLoan : r.days
  const inStock = libsInStock(item)

  const StepBar = () => (
    <div className="steps">
      <div className={'step ' + (r.step > 1 ? 'done' : 'cur')}>
        <span className="n">1</span>Pickup
      </div>
      <div className="sep" />
      <div className={'step ' + (r.step === 2 ? 'cur' : r.step > 2 ? 'done' : '')}>
        <span className="n">2</span>Confirm
      </div>
    </div>
  )

  let body
  if (r.step === 1) {
    body = (
      <div className="panel">
        <h2>Choose pickup library</h2>
        <p className="lead">Only libraries with {item.name.toLowerCase()} in stock are shown.</p>
        {inStock.map((a) => {
          const l = libraries[a.lib]
          const sel = r.lib === a.lib
          return (
            <div
              key={a.lib}
              className={'opt' + (sel ? ' sel' : '')}
              onClick={() => setReserve({ ...r, lib: a.lib })}
            >
              <div className="radio" />
              <div className="oi">
                <div className="nm">{l.name}</div>
                <div className="mt">
                  {l.dist} mi · {l.hours}
                </div>
              </div>
              <span className={'badge ' + (a.count === 1 ? 'b-warn' : 'b-ok')}>
                <span className="dot" />
                {a.count === 1 ? '1 left' : a.count + ' available'}
              </span>
            </div>
          )
        })}

        <h2 style={{ marginTop: 26, fontSize: 18 }}>Pick up on</h2>
        <div className="date-row">
          {DATES.map((d) => {
            const sel = r.date === d.full
            return (
              <button
                key={d.full}
                className={'date-btn' + (sel ? ' sel' : '')}
                onClick={() => setReserve({ ...r, date: d.full })}
              >
                <div className="d">{d.d}</div>
                <div className="n">{d.n}</div>
              </button>
            )
          })}
        </div>

        <h2 style={{ marginTop: 26, fontSize: 18 }}>Loan length</h2>
        <div className="date-row">
          {loanOptions(item.maxLoan).map((days) => {
            const sel = chosenDays === days
            return (
              <button
                key={days}
                className={'dur-btn' + (sel ? ' sel' : '')}
                onClick={() => setReserve({ ...r, days })}
              >
                {days + (days === 1 ? ' day' : ' days')}
              </button>
            )
          })}
        </div>
        <div className="dur-hint">This item can be borrowed for up to {item.maxLoan} days.</div>

        <div className="flow-actions">
          <button className="btn btn-ghost" onClick={() => go('item')}>
            ← Back to item
          </button>
          <button className="btn" disabled={!r.lib || !r.date} onClick={() => setReserve({ ...r, step: 2 })}>
            Continue
          </button>
        </div>
      </div>
    )
  } else {
    const l = libraries[r.lib]
    body = (
      <div className="panel">
        <h2>Review your reservation</h2>
        <p className="lead">
          Confirm the details below. The item is held for you for 24 hours after pickup opens.
        </p>
        <div className="ticket" style={{ boxShadow: 'none', marginTop: 18 }}>
          <div className="ticket-top">
            <div className="em" style={{ background: thumbBg(item.category), padding: 10, borderRadius: 12 }}>
              <span className="mono-thumb sm">{monogram(item.name)}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{item.name}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 3 }}>{item.fee}</div>
            </div>
          </div>
          <div className="ticket-info">
            <div>
              <div className="k">Pickup library</div>
              <div className="v">{l.name}</div>
            </div>
            <div>
              <div className="k">Pickup date</div>
              <div className="v">{r.date}</div>
            </div>
            <div>
              <div className="k">Loan length</div>
              <div className="v">{chosenDays + (chosenDays === 1 ? ' day' : ' days')}</div>
            </div>
            <div>
              <div className="k">Return by</div>
              <div className="v">{r.date ? returnDateStr(r.date, chosenDays) : '—'}</div>
            </div>
            <div>
              <div className="k">Borrower</div>
              <div className="v">{user.name}</div>
            </div>
          </div>
        </div>
        <div className="toggle-row">
          <div>
            <div className="t">Pickup & return reminders</div>
            <div className="s">Get a text the day before pickup and before it's due back.</div>
          </div>
          <button
            className={'switch' + (r.reminders ? ' on' : '')}
            role="switch"
            aria-checked={String(r.reminders)}
            onClick={() => setReserve({ ...r, reminders: !r.reminders })}
          />
        </div>
        <div className="flow-actions">
          <button className="btn btn-ghost" onClick={() => setReserve({ ...r, step: 1 })}>
            ← Back
          </button>
          <button className="btn" onClick={confirmReservation}>
            Confirm reservation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen active" id="reserve">
      <div className="wrap flow">
        <StepBar />
        {body}
      </div>
    </div>
  )
}
