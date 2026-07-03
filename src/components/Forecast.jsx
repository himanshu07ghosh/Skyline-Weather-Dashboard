import WeatherIcon from './WeatherIcon'

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Forecast({ days, units }) {
  if (!days || days.length === 0) return null

  const tempUnit = units === 'metric' ? '°' : '°'

  return (
    <section className="forecast">
      <div className="forecast-header">
        <h3>5-day outlook</h3>
        <p>Daily highs and lows</p>
      </div>
      <div className="forecast-strip">
        {days.map((day, i) => {
          const date = new Date(day.date)
          const label = i === 0 ? 'Today' : WEEKDAY[date.getUTCDay()]
          
          // FIX: Ensure pop is a number between 0-100
          const rainChance = typeof day.pop === 'number' ? Math.round(day.pop) : 0
          const showRain = rainChance > 0
          
          return (
            <div className="forecast-card" key={day.date}>
              <p className="forecast-day">{label}</p>
              <WeatherIcon condition={day.condition} icon={day.icon} className="forecast-icon" />
              <p className="forecast-desc">{day.description || day.condition}</p>
              <div className="forecast-temps">
                <span className="forecast-max">{Math.round(day.max)}{tempUnit}</span>
                <span className="forecast-min">{Math.round(day.min)}{tempUnit}</span>
              </div>
              {showRain && (
                <p className="forecast-pop">☂ {rainChance}%</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
