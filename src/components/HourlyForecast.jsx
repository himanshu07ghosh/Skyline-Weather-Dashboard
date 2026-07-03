import WeatherIcon from './WeatherIcon'

export default function HourlyForecast({ data, units }) {
  if (!data || data.length === 0) return null

  const tempUnit = units === 'metric' ? '°C' : '°F'

  // Format time (e.g., "3 PM", "6 AM")
  const formatTime = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12} ${ampm}`
  }

  // Check if it's current hour
  const isCurrentHour = (hour) => {
    const now = new Date()
    return hour === now.getHours()
  }

  return (
    <section className="hourly-forecast">
      <div className="hourly-header">
        <h3>📍 Hourly Forecast</h3>
        <span className="hourly-subtitle">Next 24 hours</span>
      </div>
      
      <div className="hourly-scroll">
        {data.map((entry, index) => {
          const showRain = entry.pop > 25 // Only show if rain chance > 25%
          
          return (
            <div 
              key={index} 
              className={`hourly-card ${isCurrentHour(entry.hour) ? 'current-hour' : ''}`}
            >
              <div className="hourly-time">
                {index === 0 ? 'Now' : formatTime(entry.hour)}
              </div>
              
              <div className="hourly-temp">
                {entry.temp}{tempUnit}
              </div>
              
              <WeatherIcon 
                condition={entry.condition} 
                icon={entry.icon} 
                className="hourly-icon" 
              />
              
              {showRain && (
                <div className="hourly-rain">
                  <span className="rain-icon">☂️</span>
                  <span className="rain-chance">{entry.pop}%</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
