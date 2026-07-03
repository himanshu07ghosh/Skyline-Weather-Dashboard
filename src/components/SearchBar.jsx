import { useState, useEffect, useRef } from 'react'
import { searchCities } from '../api/weather'

export default function SearchBar({ onSearch, onUseLocation, units, onToggleUnits, loading }) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef(null)

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.trim().length < 2) {
        setSuggestions([])
        return
      }
      try {
        const results = await searchCities(value.trim())
        setSuggestions(results)
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } catch (error) {
        setSuggestions([])
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300) // Debounce API calls
    return () => clearTimeout(debounceTimer)
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSuggestionClick(suggestion) {
    setValue(suggestion.display)
    onSearch(suggestion.name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrap" ref={wrapperRef}>
        <svg className="search-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search a city — try Dehradun, Manali, Shimla…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim().length >= 2 && setShowSuggestions(true)}
          aria-label="Search city"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.lat}-${suggestion.lon}`}
                className={`suggestion-item ${index === selectedIndex ? 'active' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="suggestion-name">{suggestion.name}</span>
                {suggestion.state && (
                  <span className="suggestion-state">, {suggestion.state}</span>
                )}
                <span className="suggestion-country">, {suggestion.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !value.trim()}>
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
