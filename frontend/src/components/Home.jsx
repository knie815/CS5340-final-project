import { useState } from 'react'
import { useApp } from '../AppContext'

export default function Home() {
  const {
    items, libraries, categories, maxDist,
    setQuery, setFilterCat, setFilterLib, setMaxDist, go,
  } = useApp()

  const [heroQuery, setHeroQuery] = useState('')
  const [heroCat, setHeroCat] = useState('')
  const [heroDist, setHeroDist] = useState(maxDist)

  const nearby = Object.entries(libraries).slice(0, 4)

  const runSearch = () => {
    setQuery(heroQuery)
    setFilterCat(heroCat || null)
    setFilterLib([])
    setMaxDist(Number(heroDist))
    go('results')
  }

  const seeAll = () => {
    setQuery('')
    setFilterCat(null)
    setFilterLib([])
    go('results')
  }

  const openCategory = (key) => {
    setQuery('')
    setFilterCat(key)
    setFilterLib([])
    go('results')
  }

  return (
    <div className="screen active" id="home">
      <div className="wrap">
        <section className="hero">
          <div className="eyebrow">Search nearby libraries</div>
          <h1>Borrowing made simple</h1>
          <p>Search and reserve from any Library of Things near you</p>
          <div className="search-hero">
            <input
              type="text"
              placeholder="Try “laminator”, “carpet cleaner”, “drill”…"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch()
              }}
            />
            <select
              className="hero-select"
              aria-label="Category"
              value={heroCat}
              onChange={(e) => setHeroCat(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="hero-select"
              aria-label="Distance"
              value={heroDist}
              onChange={(e) => setHeroDist(e.target.value)}
            >
              {[2, 5, 10].map((d) => (
                <option key={d} value={d}>
                  Within {d} mi
                </option>
              ))}
            </select>
            <button className="btn" onClick={runSearch}>
              Search
            </button>
          </div>
        </section>

        <div className="section-head">
          <h2>Browse by category</h2>
          <button className="link" onClick={seeAll}>
            See all items →
          </button>
        </div>
        <div className="cat-grid">
          {categories.map((c) => {
            const n = items.filter((i) => i.category === c.key).length
            return (
              <button key={c.key} className="cat" onClick={() => openCategory(c.key)}>
                <div className="name">{c.name}</div>
                <div className="count">
                  {n} item{n === 1 ? '' : 's'}
                </div>
              </button>
            )
          })}
        </div>

        <div className="section-head">
          <h2>Libraries near you</h2>
        </div>
        <div className="lib-row">
          {nearby.map(([k, l]) => (
            <div key={k} className="lib-card">
              <div className="nm">{l.name}</div>
              <div className="meta">{l.dist} mi away</div>
              <div className="mono">{l.hours}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
