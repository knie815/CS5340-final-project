import { useApp } from '../AppContext'
import { statusOf, totalCount, libsInStock, nearestDist, thumbBg, monogram } from '../helpers'

export default function ItemDetail() {
  const { currentItem: item, libraries, go, setReserve, requireAuth, toast } = useApp()
  if (!item) return null

  const st = statusOf(item)
  const sorted = item.avail
    .slice()
    .sort((a, b) => (b.count > 0) - (a.count > 0) || libraries[a.lib].dist - libraries[b.lib].dist)

  const LocLine = ({ a }) => {
    const l = libraries[a.lib]
    const badge =
      a.count === 0 ? (
        <span className="badge b-out">0 available</span>
      ) : a.count === 1 ? (
        <span className="badge b-warn">
          <span className="dot" />1 left
        </span>
      ) : (
        <span className="badge b-ok">
          <span className="dot" />
          {a.count} available
        </span>
      )
    const btn =
      a.count > 0 ? (
        <button
          className="btn btn-sm"
          onClick={() => {
            setReserve({ lib: a.lib, date: null, step: 1, reminders: true, days: null })
            requireAuth(() => go('reserve'))
          }}
        >
          Reserve
        </button>
      ) : (
        <button className="btn btn-sm btn-ghost" disabled onClick={() => toast('Notify feature coming soon')}>
          Notify me
        </button>
      )
    return (
      <div className="loc-line">
        <div className="li">
          <span className="nm">{l.name}</span>
          <span className="mt">
            {l.dist} mi · {l.hours}
          </span>
        </div>
        <div className="right">
          {badge}
          {btn}
        </div>
      </div>
    )
  }

  return (
    <div className="screen active" id="item">
      <div className="wrap detail">
        <div className="breadcrumb">
          <button onClick={() => go('home')}>Home</button>
          <span>›</span>
          <button onClick={() => go('results')}>Results</button>
          <span>›</span>
          <span>{item.name}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-media" style={{ background: thumbBg(item.category) }}>
            <span className="mono-thumb lg">{monogram(item.name)}</span>
          </div>
          <div>
            <div
              className="cat-tag mono"
              style={{ color: 'var(--text-3)', textTransform: 'uppercase', fontSize: 12, letterSpacing: '.05em' }}
            >
              {item.cat}
            </div>
            <h1>{item.name}</h1>
            <div style={{ marginTop: 12 }}>
              <span className={`badge ${st.cls}`}>
                <span className="dot" />
                {st.txt + ' · ' + totalCount(item) + ' total nearby'}
              </span>
            </div>
            <p className="desc">{item.desc}</p>
            <div className="spec-row">
              <div className="spec">
                <div className="k">Loan</div>
                <div className="v">{item.fee}</div>
              </div>
              <div className="spec">
                <div className="k">Deposit</div>
                <div className="v">{item.deposit}</div>
              </div>
              <div className="spec">
                <div className="k">Nearest</div>
                <div className="v">{libsInStock(item).length ? nearestDist(item, libraries).toFixed(1) + ' mi' : '—'}</div>
              </div>
            </div>
            <div className="avail-panel">
              <div className="ap-head">
                <span>Availability by library</span>
                <span className="live">
                  <span className="dot" />
                  LIVE
                </span>
              </div>
              {sorted.map((a) => (
                <LocLine key={a.lib} a={a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
