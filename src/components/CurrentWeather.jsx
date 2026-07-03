import WeatherIcon, { conditionToMood } from './WeatherIcon'

function formatTime(unixSeconds, timezoneOffsetSeconds) {
  if (!unixSeconds || unixSeconds === 0) return '—'
  const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000)
  return date.toUTCString().slice(17, 22)
}

export default function CurrentWeather({ data, place, units, localTime }) {
  if (!data) return null

  const { weather, main, wind, sys, visibility } = data
  const condition = weather?.[0]?.main || 'Clouds'
  const mood = conditionToMood(condition)
  const tempUnit = units === 'metric' ? '°C' : '°F'
  
  // Safe fallbacks
  const windSpeed = wind?.speed ? (units === 'metric' ? Math.round(wind.speed * 3.6) : Math.round(wind.speed)) : '—'
  const speedUnit = units === 'metric' ? 'km/h' : 'mph'
  const humidity = main?.humidity || '—'
  const pressure = main?.pressure || '—'
  const visibilityKm = visibility ? (visibility / 1000).toFixed(1) : '—'
  const sunrise = sys?.sunrise ? formatTime(sys.sunrise, data.timezone || 0) : '—'
  const sunset = sys?.sunset ? formatTime(sys.sunset, data.timezone || 0) : '—'

  return (
    <section className={`hero-card ${mood}`}>
      <div className="hero-top">
        <div>
          <p className="hero-eyebrow">Current conditions</p>
          <h2 className="hero-place">
            {place?.name || 'Unknown'}
            {place?.country ? `, ${place.country}` : ''}
          </h2>
          <p className="hero-time">{localTime || '—'}</p>
        </div>
        <WeatherIcon condition={condition} icon={weather?.[0]?.icon} className="hero-icon" />
      </div>

      <div className="hero-temp-row">
        <span className="hero-temp">
          {main?.temp !== undefined ? Math.round(main.temp) : '—'}
          <span className="hero-temp-unit">{tempUnit}</span>
        </span>
        <div className="hero-temp-meta">
          <p className="hero-condition">{weather?.[0]?.description || '—'}</p>
          <p className="hero-feels">
            Feels like {main?.feels_like !== undefined ? Math.round(main.feels_like) : '—'}{tempUnit}
          </p>
        </div>
      </div>

      <div className="hero-range">
        <span>Low {main?.temp_min !== undefined ? Math.round(main.temp_min) : '—'}{tempUnit}</span>
        <span className="hero-range-sep" />
        <span>High {main?.temp_max !== undefined ? Math.round(main.temp_max) : '—'}{tempUnit}</span>
      </div>

      <div className="hero-grid">
        <div className="hero-stat">
          <p className="hero-stat-label">Humidity</p>
          <p className="hero-stat-value">{humidity}%</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Wind</p>
          <p className="hero-stat-value">{windSpeed} {windSpeed !== '—' ? speedUnit : ''}</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Pressure</p>
          <p className="hero-stat-value">{pressure} hPa</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Visibility</p>
          <p className="hero-stat-value">{visibilityKm} km</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Sunrise</p>
          <p className="hero-stat-value">{sunrise}</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Sunset</p>
          <p className="hero-stat-value">{sunset}</p>
        </div>
      </div>
    </section>
  )
}
