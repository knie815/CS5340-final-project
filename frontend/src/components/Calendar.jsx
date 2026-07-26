import { useState } from 'react'
import { monthGrid, monthLabel, todayISO } from '../helpers'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Airbnb-style month calendar for picking a pickup→return range.
// Presentational: it reports clicks via onPick(iso); the parent owns the
// start/end selection + validation. `isDisabled(iso)` grays out days
// (past dates and fully-booked days).
export default function Calendar({ start, end, isDisabled, onPick }) {
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const d = start ? new Date(start + 'T00:00:00') : new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const cells = monthGrid(cursor.y, cursor.m)
  const now = new Date()
  const atCurrentMonth = cursor.y === now.getFullYear() && cursor.m === now.getMonth()

  const shift = (delta) => {
    const d = new Date(cursor.y, cursor.m + delta, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  const inRange = (iso) => start && end && iso > start && iso < end

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" disabled={atCurrentMonth} onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <span className="cal-title">{monthLabel(cursor.y, cursor.m)}</span>
        <button type="button" className="cal-nav" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid cal-dow">
        {DOW.map((d) => (
          <span key={d} className="cal-dow-cell">{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((iso, i) => {
          if (iso == null) return <span key={'e' + i} className="cal-cell empty" />
          const disabled = isDisabled(iso)
          const cls = [
            'cal-cell',
            disabled ? 'disabled' : '',
            iso === start ? 'start' : '',
            iso === end ? 'end' : '',
            inRange(iso) ? 'inrange' : '',
            iso === today && !disabled ? 'today' : '',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={disabled}
              onClick={() => onPick(iso)}
            >
              {Number(iso.slice(8, 10))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
