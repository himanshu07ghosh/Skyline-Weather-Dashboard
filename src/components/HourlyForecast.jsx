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

  // Filter to show only current and future hours
  const now = new Date()
  const currentHour = now.getHours()
  
  // Find the index of the current hour in the data
  let startIndex = data.findIndex(entry => entry.hour === currentHour)
  
  // If current hour not found, start from 0
  if (startIndex === -1) startIndex = 0
  
  // Get only current and future hours (max 24)
  const futureData = data.slice(startIndex, startIndex + 24)
  
  // If we don't have enough hours, wrap around to the next day
  if (futureData.length < 24) {
    const remaining = 24 - futureData.length
    futureData.push(...data.slice(0, remaining))
  }

  return (
    <section className="hourly-forecast">
      <div className="hourly-header">
        <h3>🔍 Hourly Forecast</h3>
        <span className="hourly-subtitle">Next 24 hours</span>
      </div>
      
      <div className="hourly-scroll">
        {futureData.map((entry, index) => {
          const showRain = entry.pop > 25
          const isNow = index === 0 // First card is always "Now"
          
          return (
            <div 
              key={index} 
              className={`hourly-card ${isCurrentHour(entry.hour) ? 'current-hour' : ''}`}
            >
              <div className="hourly-time">
                {isNow ? 'Now' : formatTime(entry.hour)}
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
