import { useState } from 'react'

export default function SearchBar({ onSearch, onUseLocation, units, onToggleUnits, loading }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search a city — try Dehradun, Manali, Shimla…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Search city"
        />
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Search
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onUseLocation}
          disabled={loading}
          title="Use my current location"
        >
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="btn-label">Locate me</span>
        </button>
        <button type="button" className="unit-toggle" onClick={onToggleUnits} aria-label="Toggle units">
          <span className={units === 'metric' ? 'active' : ''}>°C</span>
          <span className="divider">/</span>
          <span className={units === 'imperial' ? 'active' : ''}>°F</span>
        </button>
      </div>
    </form>
  )
}
