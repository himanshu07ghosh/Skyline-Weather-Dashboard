import WeatherIcon from './WeatherIcon'

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Forecast({ days, units }) {
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
          return (
            <div className="forecast-card" key={day.date}>
              <p className="forecast-day">{label}</p>
              <WeatherIcon condition={day.condition} icon={day.icon} className="forecast-icon" />
              <p className="forecast-desc">{day.description}</p>
              <div className="forecast-temps">
                <span className="forecast-max">{Math.round(day.max)}{tempUnit}</span>
                <span className="forecast-min">{Math.round(day.min)}{tempUnit}</span>
              </div>
              {day.pop > 0 && (
                <p className="forecast-pop">☂ {Math.round(day.pop * 100)}%</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
