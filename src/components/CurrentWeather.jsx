import WeatherIcon, { conditionToMood } from './WeatherIcon'

function formatTime(unixSeconds, timezoneOffsetSeconds) {
  const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000)
  return date.toUTCString().slice(17, 22)
}

export default function CurrentWeather({ data, place, units, localTime }) {
  const { weather, main, wind, sys, visibility } = data
  const condition = weather[0].main
  const mood = conditionToMood(condition)
  const tempUnit = units === 'metric' ? '°C' : '°F'
  const speedUnit = units === 'metric' ? 'km/h' : 'mph'
  const windSpeed = units === 'metric' ? Math.round(wind.speed * 3.6) : Math.round(wind.speed)

  return (
    <section className={`hero-card ${mood}`}>
      <div className="hero-top">
        <div>
          <p className="hero-eyebrow">Current conditions</p>
          <h2 className="hero-place">
            {place.name}
            {place.country ? `, ${place.country}` : ''}
          </h2>
          <p className="hero-time">{localTime}</p>
        </div>
        <WeatherIcon condition={condition} icon={weather[0].icon} className="hero-icon" />
      </div>

      <div className="hero-temp-row">
        <span className="hero-temp">
          {Math.round(main.temp)}
          <span className="hero-temp-unit">{tempUnit}</span>
        </span>
        <div className="hero-temp-meta">
          <p className="hero-condition">{weather[0].description}</p>
          <p className="hero-feels">Feels like {Math.round(main.feels_like)}{tempUnit}</p>
        </div>
      </div>

      <div className="hero-range">
        <span>Low {Math.round(main.temp_min)}{tempUnit}</span>
        <span className="hero-range-sep" />
        <span>High {Math.round(main.temp_max)}{tempUnit}</span>
      </div>

      <div className="hero-grid">
        <div className="hero-stat">
          <p className="hero-stat-label">Humidity</p>
          <p className="hero-stat-value">{main.humidity}%</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Wind</p>
          <p className="hero-stat-value">{windSpeed} {speedUnit}</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Pressure</p>
          <p className="hero-stat-value">{main.pressure} hPa</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Visibility</p>
          <p className="hero-stat-value">{(visibility / 1000).toFixed(1)} km</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Sunrise</p>
          <p className="hero-stat-value">{formatTime(sys.sunrise, data.timezone)}</p>
        </div>
        <div className="hero-stat">
          <p className="hero-stat-label">Sunset</p>
          <p className="hero-stat-value">{formatTime(sys.sunset, data.timezone)}</p>
        </div>
      </div>
    </section>
  )
}
