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
  if (!query || query.length < 2) return [] // Minimum 2 characters for suggestions
  
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
    hourly: getHourlyForecast(forecast.list) // Add hourly data
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
/**
 * Extract hourly forecast for the next 24 hours from the 3-hour forecast data
 * Returns array of hourly data points (every 3 hours for next 24 hours = 8 points)
 */
export function getHourlyForecast(forecastList) {
  // Take the first 8 entries (24 hours / 3 hours = 8)
  const hourlyData = forecastList.slice(0, 8).map((entry) => ({
    time: new Date(entry.dt * 1000),
    hour: new Date(entry.dt * 1000).getHours(),
    temp: Math.round(entry.main.temp),
    feels_like: Math.round(entry.main.feels_like),
    condition: entry.weather[0].main,
    description: entry.weather[0].description,
    icon: entry.weather[0].icon,
    pop: Math.round((entry.pop || 0) * 100), // Rain chance as percentage
    humidity: entry.main.humidity,
    wind_speed: Math.round(entry.wind.speed * 3.6), // Convert to km/h
    pressure: entry.main.pressure,
  }))
  
  return hourlyData
}
