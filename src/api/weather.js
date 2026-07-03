// All calls go through OpenWeatherMap (https://openweathermap.org/api)
// Get a free API key at https://home.openweathermap.org/users/sign_up
// and put it in a .env file as VITE_OWM_API_KEY=your_key_here

const API_KEY = import.meta.env.VITE_OWM_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEO_URL = 'https://api.openweathermap.org/geo/1.0'

function checkKey() {
  if (!API_KEY) {
    throw new Error(
      'Missing API key. Add VITE_OWM_API_KEY=your_key to a .env file at the project root, then restart the dev server.'
    )
  }
}

/**
 * Resolve a free-text city search into a list of matching places.
 * Returns [{ name, state, country, lat, lon, display }]
 */
export async function searchCities(query) {
  checkKey()
  if (!query || query.length < 2) return []
  
  const url = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not search for that city right now.')
  const data = await res.json()
  
  return data.map((place) => ({
    name: place.name,
    state: place.state || '',
    country: place.country,
    lat: place.lat,
    lon: place.lon,
    display: `${place.name}${place.state ? `, ${place.state}` : ''}, ${place.country}`
  }))
}

/**
 * Get hourly forecast data (24 hours) - ONE PER HOUR
 * Interpolates between 3-hour data points to create hourly data
 */
export function getHourlyForecast24(forecastList) {
  const hourlyData = []
  
  // Get the first 9 points (covers 24 hours)
  const baseData = forecastList.slice(0, 9)
  
  for (let i = 0; i < baseData.length - 1; i++) {
    const current = baseData[i]
    const next = baseData[i + 1]
    
    // Add the current hour
    hourlyData.push({
      time: new Date(current.dt * 1000),
      hour: new Date(current.dt * 1000).getHours(),
      temp: Math.round(current.main.temp),
      condition: current.weather[0].main,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      pop: Math.round((current.pop || 0) * 100),
    })
    
    // Add interpolated hours for the next 2 hours
    for (let hour = 1; hour < 3; hour++) {
      const fraction = hour / 3
      const temp = current.main.temp + (next.main.temp - current.main.temp) * fraction
      const pop = (current.pop || 0) + ((next.pop || 0) - (current.pop || 0)) * fraction
      
      const date = new Date(current.dt * 1000 + hour * 3600000)
      
      hourlyData.push({
        time: date,
        hour: date.getHours(),
        temp: Math.round(temp),
        condition: current.weather[0].main,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        pop: Math.round(pop * 100),
      })
    }
  }
  
  // Add the last entry
  const last = baseData[baseData.length - 1]
  hourlyData.push({
    time: new Date(last.dt * 1000),
    hour: new Date(last.dt * 1000).getHours(),
    temp: Math.round(last.main.temp),
    condition: last.weather[0].main,
    description: last.weather[0].description,
    icon: last.weather[0].icon,
    pop: Math.round((last.pop || 0) * 100),
  })
  
  // Return all 24 hours
  return hourlyData.slice(0, 24)
}

/**
 * Current conditions + 5 day / 3 hour forecast for a given lat/lon.
 */
export async function getWeatherByCoords(lat, lon, units = 'metric') {
  checkKey()
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`),
  ])

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error('Weather data is unavailable for this location right now.')
  }

  const current = await currentRes.json()
  const forecast = await forecastRes.json()

  return { 
    current, 
    forecast: buildDailyForecast(forecast.list),
    hourly: getHourlyForecast24(forecast.list)
  }
}

/**
 * Convenience helper: look up a city name, then fetch its weather.
 */
export async function getWeatherByCity(city, units = 'metric') {
  const matches = await searchCities(city)
  if (matches.length === 0) {
    throw new Error(`Could not find a place named "${city}".`)
  }
  const { lat, lon, name, state, country } = matches[0]
  const weather = await getWeatherByCoords(lat, lon, units)
  return { ...weather, resolvedPlace: { name, state, country, lat, lon } }
}

/**
 * The forecast endpoint returns data in 3-hour steps for 5 days.
 * Collapse that into one representative entry per calendar day.
 */
function buildDailyForecast(list) {
  const days = {}

  list.forEach((entry) => {
    const date = entry.dt_txt.split(' ')[0]
    if (!days[date]) days[date] = []
    days[date].push(entry)
  })

  return Object.entries(days)
    .slice(0, 5)
    .map(([date, entries]) => {
      // Prefer the entry closest to midday for a representative icon/summary
      const midday = entries.reduce((best, entry) => {
        const hour = Number(entry.dt_txt.split(' ')[1].split(':')[0])
        const bestHour = Number(best.dt_txt.split(' ')[1].split(':')[0])
        return Math.abs(hour - 13) < Math.abs(bestHour - 13) ? entry : best
      }, entries[0])

      const temps = entries.map((e) => e.main.temp)

      return {
        date,
        min: Math.min(...temps),
        max: Math.max(...temps),
        condition: midday.weather[0].main,
        description: midday.weather[0].description,
        icon: midday.weather[0].icon,
        pop: Math.max(...entries.map((e) => e.pop ?? 0)),
      }
    })
}
