import { useEffect, useState } from 'react'
import { useApp } from '../AppContext'
import { getItemAvailability } from '../api'
import { addDaysISO, diffDaysISO, formatDate, loanLabel, thumbBg, monogram } from '../helpers'
import Calendar from './Calendar'

export default function Reserve() {
  const { currentItem: item, libraries, reserve: r, setReserve, confirmReservation, go, toast, user } = useApp()

  // Availability for the selected library (unavailable dates + today marker).
  const [avail, setAvail] = useState({ unavailable: new Set(), today: null, capacity: 0, loading: true })

  useEffect(() => {
    if (!item || !r.lib) return
    let active = true
    setAvail((a) => ({ ...a, loading: true }))
    getItemAvailability(item.id, r.lib)
      .then((data) => {
        if (!active) return
        setAvail({ unavailable: new Set(data.unavailable), today: data.today, capacity: data.capacity, loading: false })
      })
      .catch(() => active && setAvail({ unavailable: new Set(), today: null, capacity: 0, loading: false }))
    return () => {
      active = false
    }
  }, [item, r.lib])

  if (!item) return null

  const libOptions = item.avail.filter((a) => a.capacity > 0)
  const sameDay = !!r.sameDay
  const nights = r.start && r.end ? diffDaysISO(r.start, r.end) : 0

  // While choosing a return date (start set, end not) in range mode, cap the
  // selectable window to the max loan and stop before the next booked day.
  const selectingEnd = !sameDay && r.start && !r.end
  const maxEndISO = r.start ? addDaysISO(r.start, item.maxLoan) : null
  const firstBookedAfterStart = r.start
    ? [...avail.unavailable].filter((d) => d > r.start).sort()[0]
    : null

  const isDisabled = (iso) => {
    if (avail.today && iso < avail.today) return true // past
    if (avail.unavailable.has(iso)) return true // fully booked
    if (selectingEnd && iso > r.start) {
      if (iso > maxEndISO) return true // beyond max loan length
      if (firstBookedAfterStart && iso > firstBookedAfterStart) return true // would span a booked day
    }
    return false
  }

  // No fully-booked day may fall inside [start, end) (the return day is free).
  const rangeHasBlocked = (start, end) => {
    for (let d = start; d < end; d = addDay(d)) {
      if (avail.unavailable.has(d)) return true
    }
    return false
  }

  const handlePick = (iso) => {
    // Same-day mode: one click picks a single day (pickup == return); click it
    // again to clear.
    if (sameDay) {
      setReserve({ ...r, start: r.start === iso ? null : iso, end: r.start === iso ? null : iso })
      return
    }
    // Start a fresh range if nothing started yet, or a full range already chosen.
    if (!r.start || (r.start && r.end)) {
      setReserve({ ...r, start: iso, end: null })
      return
    }
    // Clicking the pickup date again clears the selection.
    if (iso === r.start) {
      setReserve({ ...r, start: null, end: null })
      return
    }
    // Have a start, choosing the end.
    if (iso < r.start) {
      setReserve({ ...r, start: iso, end: null })
      return
    }
    const len = diffDaysISO(r.start, iso)
    if (len > item.maxLoan) {
      toast(`This item can be borrowed for up to ${item.maxLoan} days`)
      return
    }
    if (rangeHasBlocked(r.start, iso)) {
      toast('Those dates include an unavailable day — pick a shorter range')
      return
    }
    setReserve({ ...r, end: iso })
  }

  const selectLib = (lib) => setReserve({ ...r, lib, start: null, end: null })

  const StepBar = () => (
    <div className="steps">
      <div className={'step ' + (r.step > 1 ? 'done' : 'cur')}>
        <span className="n">1</span>Dates
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
        <p className="lead">Pick a location, then choose your dates. Booked dates are greyed out.</p>
        {libOptions.map((a) => {
          const l = libraries[a.lib]
          const sel = r.lib === a.lib
          const badge = (
            <span className={'badge ' + (a.count > 0 ? 'b-ok' : 'b-warn')}>
              <span className="dot" />
              {a.count} available today
            </span>
          )
          return (
            <div key={a.lib} className={'opt' + (sel ? ' sel' : '')} onClick={() => selectLib(a.lib)}>
              <div className="radio" />
              <div className="oi">
                <div className="nm">{l.name}</div>
                <div className="mt">
                  {l.dist} mi · {l.hours}
                </div>
              </div>
              {badge}
            </div>
          )
        })}

        <div className="dates-head">
          <h2 style={{ fontSize: 18 }}>Choose your dates</h2>
          <label className="facet same-day-toggle">
            <input
              type="checkbox"
              checked={sameDay}
              onChange={(e) => setReserve({ ...r, sameDay: e.target.checked, start: null, end: null })}
            />
            Same-day return
          </label>
        </div>
        {avail.loading ? (
          <p className="dur-hint">Loading availability…</p>
        ) : (
          <>
            <Calendar start={r.start} end={r.end} isDisabled={isDisabled} onPick={handlePick} />
            <div className="cal-summary">
              {sameDay && r.start ? (
                <span>
                  <b>{formatDate(r.start)}</b> · same-day pickup & return
                </span>
              ) : r.start && r.end ? (
                <span>
                  <b>{formatDate(r.start)}</b> → <b>{formatDate(r.end)}</b> · {loanLabel(nights)}
                </span>
              ) : r.start ? (
                <span>Pickup <b>{formatDate(r.start)}</b> — now choose a return date.</span>
              ) : sameDay ? (
                <span>Select the day you'll pick up and return the item.</span>
              ) : (
                <span>Select a pickup date to begin.</span>
              )}
              {(r.start || r.end) && (
                <button className="link" onClick={() => setReserve({ ...r, start: null, end: null })}>
                  Clear
                </button>
              )}
            </div>
            <div className="dur-hint">This item can be borrowed for up to {item.maxLoan} days.</div>
          </>
        )}

        <div className="flow-actions">
          <button className="btn btn-ghost" onClick={() => go('item')}>
            ← Back to item
          </button>
          <button
            className="btn"
            disabled={!r.lib || !r.start || !r.end}
            onClick={() => setReserve({ ...r, step: 2 })}
          >
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
              <div className="v">{formatDate(r.start)}</div>
            </div>
            <div>
              <div className="k">Return by</div>
              <div className="v">{sameDay ? formatDate(r.start) + ' (same day)' : formatDate(r.end)}</div>
            </div>
            <div>
              <div className="k">Loan length</div>
              <div className="v">{loanLabel(nights)}</div>
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

// Local helper: ISO date + 1 day (used only for the range-scan loop above).
function addDay(iso) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
