import { useApp } from '../AppContext'
import { filteredItems } from '../helpers'
import ItemCard from './ItemCard'

function Facet({ label, checked, onChange, type = 'checkbox', name }) {
  return (
    <label className={'facet' + (checked ? ' on' : '')}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  )
}

export default function Results() {
  const {
    items, libraries, categories, go,
    query, filterCat, setFilterCat, filterLib, setFilterLib,
    onlyAvailable, setOnlyAvailable, maxDist, setMaxDist, sortBy, setSortBy,
  } = useApp()

  const list = filteredItems(items, { query, filterCat, filterLib, onlyAvailable, maxDist, sortBy }, libraries)
  const title = filterCat
    ? categories.find((c) => c.key === filterCat)?.name
    : query
    ? `“${query}”`
    : 'All items'

  const toggleLib = (key, checked) => {
    setFilterLib(checked ? [...filterLib, key] : filterLib.filter((k) => k !== key))
  }

  const resetFilters = () => {
    setOnlyAvailable(false)
    setMaxDist(10)
    setFilterCat(null)
    setFilterLib([])
  }

  const catOptions = [{ key: null, name: 'All categories', em: '' }, ...categories]

  return (
    <div className="screen active" id="results">
      <div className="wrap">
        <div className="results-top">
          <div className="breadcrumb">
            <button onClick={() => go('home')}>Home</button>
            <span>›</span>
            <span>{filterCat ? 'Category' : 'Search'}</span>
          </div>
          <h1 style={{ fontSize: 28, marginTop: 8 }}>Results for {title}</h1>
        </div>
        <div className="results-layout">
          <aside className="filters">
            <div className="filter-group">
              <h4>Availability</h4>
              <Facet
                label="In stock"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
            </div>
            <div className="filter-group">
              <h4>Distance</h4>
              <div className="dist-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={maxDist}
                  aria-label="Maximum distance in miles"
                  onChange={(e) => setMaxDist(Number(e.target.value))}
                />
                <div className="dist-scale">
                  <span>1 mi</span>
                  <span>10 mi</span>
                </div>
                <div className="dist-value">Within {maxDist} mi</div>
              </div>
            </div>
            <div className="filter-group">
              <h4>Location</h4>
              {Object.entries(libraries).map(([key, l]) => (
                <Facet
                  key={key}
                  label={l.name}
                  checked={filterLib.includes(key)}
                  onChange={(e) => toggleLib(key, e.target.checked)}
                />
              ))}
            </div>
            <div className="filter-group">
              <h4>Category</h4>
              {catOptions.map((c) => (
                <Facet
                  key={c.key ?? 'all'}
                  type="radio"
                  name="cat"
                  label={(c.em ? c.em + ' ' : '') + c.name}
                  checked={filterCat === c.key}
                  onChange={() => setFilterCat(c.key)}
                />
              ))}
            </div>
          </aside>

          <div>
            <div className="results-head">
              <div className="count">
                <b>{list.length}</b> item{list.length === 1 ? '' : 's'} found across{' '}
                {Object.keys(libraries).length} libraries
              </div>
              <label className="sort-control">
                Sort by
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort results by">
                  <option value="distance">Distance</option>
                  <option value="availability">Availability</option>
                </select>
              </label>
            </div>
            {list.length ? (
              <div className="grid-items">
                {list.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <p style={{ marginTop: 10, fontWeight: 600 }}>No items match those filters</p>
                <p>Try widening the distance or turning off “in stock only”.</p>
                <button className="btn-ghost btn" style={{ marginTop: 14 }} onClick={resetFilters}>
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
