import { useApp } from '../AppContext'
import { statusOf, totalCount, libsInStock, nearestDist, thumbBg, monogram } from '../helpers'

export default function ItemDetail() {
  const { currentItem: item, libraries, go, setReserve, requireAuth } = useApp()
  if (!item) return null

  const st = statusOf(item)
  // Only libraries that actually hold copies of this item (capacity > 0).
  const sorted = item.avail
    .filter((a) => a.capacity > 0)
    .sort((a, b) => (b.count > 0) - (a.count > 0) || libraries[a.lib].dist - libraries[b.lib].dist)

  const LocLine = ({ a }) => {
    const l = libraries[a.lib]
    const badge = (
      <span className={'badge ' + (a.count > 0 ? 'b-ok' : 'b-warn')}>
        <span className="dot" />
        {a.count} available today
      </span>
    )
    const btn = (
      <button
        className="btn btn-sm"
        onClick={() => {
          setReserve({ lib: a.lib, start: null, end: null, step: 1, reminders: true })
          requireAuth(() => go('reserve'))
        }}
      >
        Reserve
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
              </div>
              {sorted.length ? (
                sorted.map((a) => <LocLine key={a.lib} a={a} />)
              ) : (
                <div className="loc-line">
                  <div className="li">
                    <span className="mt">No libraries currently carry this item.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
