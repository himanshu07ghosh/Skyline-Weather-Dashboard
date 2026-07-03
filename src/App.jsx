import { useEffect, useState, useCallback } from 'react'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import Forecast from './components/Forecast'
import { getWeatherByCity, getWeatherByCoords } from './api/weather'
import './App.css'

const HOME_CITY = 'Dehradun'

function getLocalTime(timezoneOffsetSeconds) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const local = new Date(utc + timezoneOffsetSeconds * 1000)
  return local.toLocaleString('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function App() {
  const [weather, setWeather] = useState(null)
  const [place, setPlace] = useState(null)
  const [units, setUnits] = useState('metric')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const runSearch = useCallback(async (city, unitsOverride) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getWeatherByCity(city, unitsOverride || units)
      setWeather(result)
      setPlace(result.resolvedPlace)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [units])

  const runCoords = useCallback(async (lat, lon, unitsOverride) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getWeatherByCoords(lat, lon, unitsOverride || units)
      setWeather(result)
      setPlace({ name: result.current.name, country: result.current.sys.country })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [units])

  useEffect(() => {
    runSearch(HOME_CITY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => runCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError('Could not access your location. Search for a city instead.')
        setLoading(false)
      }
    )
  }

  function handleToggleUnits() {
    const next = units === 'metric' ? 'imperial' : 'metric'
    setUnits(next)
    if (place && weather) {
      const lat = weather.resolvedPlace?.lat ?? weather.current.coord.lat
      const lon = weather.resolvedPlace?.lon ?? weather.current.coord.lon
      runCoords(lat, lon, next)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span className="brand-mark" aria-hidden="true" style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #33628f, #e59a52)',
            boxShadow: '0 4px 12px rgba(51, 98, 143, 0.3)'
          }} />
          <div>
            <div style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '1.8rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: '1.1'
            }}>
              Skyline Weather
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: 'var(--text-tertiary)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Real-time Weather Dashboard
            </div>
          </div>
        </div>
        <SearchBar
          onSearch={runSearch}
          onUseLocation={handleUseLocation}
          units={units}
          onToggleUnits={handleToggleUnits}
          loading={loading}
        />
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {loading && !weather && <div className="skeleton" aria-label="Loading weather data" />}

        {weather && place && !loading && (
          <>
            <CurrentWeather
              data={weather.current}
              place={place}
              units={units}
              localTime={getLocalTime(weather.current.timezone)}
            />
            
            {/* Hourly Forecast - Next 24 hours */}
            {weather.hourly && weather.hourly.length > 0 && (
              <HourlyForecast data={weather.hourly} units={units} />
            )}
            
            <Forecast days={weather.forecast} units={units} />
          </>
        )}

        {weather && place && loading && (
          <div className="reloading-hint">Updating…</div>
        )}
      </main>

      <footer className="app-footer">
        <p style={{ fontSize: '1.1rem' }}>
          <strong>Built by : Himanshu Ghosh</strong> - with React &amp; the OpenWeatherMap API · Home base: Dehradun, Uttarakhand
        </p>
      </footer>
    </div>
  )
}
