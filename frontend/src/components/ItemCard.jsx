import { useApp } from '../AppContext'
import { statusOf, candidateAvail, thumbBg, monogram } from '../helpers'

export default function ItemCard({ item }) {
  const { libraries, filterLib, openItem } = useApp()
  const st = statusOf(item)
  const inStock = candidateAvail(item, filterLib).filter((a) => a.count > 0)
  const nearest = inStock.length ? Math.min(...inStock.map((a) => libraries[a.lib].dist)) : null
  const locText = inStock.length
    ? inStock.length === 1
      ? libraries[inStock[0].lib].name
      : inStock.length + ' libraries nearby'
    : 'Not available nearby'

  return (
    <button className="card" onClick={() => openItem(item.id)}>
      <div className="thumb" style={{ background: thumbBg(item.category) }}>
        <span className="mono-thumb">{monogram(item.name)}</span>
        <span className={`badge ${st.cls} avail-tag`}>
          <span className="dot" />
          {st.txt}
        </span>
      </div>
      <div className="card-body">
        <div className="cat-tag">{item.cat}</div>
        <div className="title">{item.name}</div>
        <div className="locs">{locText}</div>
        <div className="card-foot">
          <span className="dist">{nearest !== null ? nearest.toFixed(1) + ' mi' : '—'}</span>
          <span className="pill" style={{ color: 'var(--ink)', fontWeight: 700 }}>
            View →
          </span>
        </div>
      </div>
    </button>
  )
}
