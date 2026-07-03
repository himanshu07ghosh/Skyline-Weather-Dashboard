// Open-Meteo API - Completely Free, No API Key Required!
// https://open-meteo.com/

const BASE_URL = 'https://api.open-meteo.com/v1'

// Map Open-Meteo weather codes to our custom icons
function getWeatherInfo(code) {
  const weatherCodes = {
    0: { condition: 'Clear', icon: '01d' },
    1: { condition: 'Clear', icon: '01d' },
    2: { condition: 'Clouds', icon: '02d' },
    3: { condition: 'Clouds', icon: '03d' },
    45: { condition: 'Fog', icon: '50d' },
    48: { condition: 'Fog', icon: '50d' },
    51: { condition: 'Drizzle', icon: '09d' },
    53: { condition: 'Drizzle', icon: '09d' },
    55: { condition: 'Drizzle', icon: '09d' },
    56: { condition: 'Drizzle', icon: '09d' },
    57: { condition: 'Drizzle', icon: '09d' },
    61: { condition: 'Rain', icon: '10d' },
    63: { condition: 'Rain', icon: '10d' },
    65: { condition: 'Rain', icon: '10d' },
    66: { condition: 'Rain', icon: '10d' },
    67: { condition: 'Rain', icon: '10d' },
    71: { condition: 'Snow', icon: '13d' },
    73: { condition: 'Snow', icon: '13d' },
    75: { condition: 'Snow', icon: '13d' },
    77: { condition: 'Snow', icon: '13d' },
    80: { condition: 'Rain', icon: '09d' },
    81: { condition: 'Rain', icon: '09d' },
    82: { condition: 'Rain', icon: '09d' },
    85: { condition: 'Snow', icon: '13d' },
    86: { condition: 'Snow', icon: '13d' },
    95: { condition: 'Thunderstorm', icon: '11d' },
    96: { condition: 'Thunderstorm', icon: '11d' },
    99: { condition: 'Thunderstorm', icon: '11d' },
  }
  return weatherCodes[code] || { condition: 'Clouds', icon: '03d' }
}

// Get city coordinates (using Open-Meteo Geocoding)
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not find that city.')
  const data = await res.json()
  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find a place named "${city}".`)
  }
  const result = data.results[0]
  return {
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
    country: result.country,
    state: result.admin1 || '',
  }
}

// Get weather by coordinates
export async function getWeatherByCoords(lat, lon, units = 'metric') {
  const unit = units === 'metric' ? 'celsius' : 'fahrenheit'
  
  const url = `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&hourly=temperature_2m,precipitation_probability,weathercode&timezone=auto&forecast_days=5&temperature_unit=${unit}`
  
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not fetch weather data.')
  const data = await res.json()

  // Get current time
  const now = new Date()
  const currentHour = now.getHours()
  const currentDate = now.toISOString().split('T')[0]

  // Build 24-hour forecast
  const hourlyData = data.hourly.time.map((time, i) => {
    const date = new Date(time)
    const weather = getWeatherInfo(data.hourly.weathercode[i])
    return {
      time: date,
      hour: date.getHours(),
      temp: Math.round(data.hourly.temperature_2m[i]),
      condition: weather.condition,
      description: weather.condition.toLowerCase(),
      icon: weather.icon,
      pop: data.hourly.precipitation_probability[i] || 0, // Rain chance!
    }
  })

  // Get current weather (find the closest hour to now)
  let currentWeather = hourlyData.find(h => h.hour === currentHour)
  if (!currentWeather) {
    // If no exact match, use the first hour
    currentWeather = hourlyData[0]
  }

  // Build 5-day forecast
  const dailyData = data.daily.time.map((time, i) => {
    const weather = getWeatherInfo(data.daily.weathercode[i])
    return {
      date: time,
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      condition: weather.condition,
      description: weather.condition.toLowerCase(),
      icon: weather.icon,
      pop: data.daily.precipitation_probability_max[i] || 0,
    }
  })

  return {
    current: {
      name: 'Current Location',
      temp: currentWeather.temp,
      feels_like: currentWeather.temp,
      condition: currentWeather.condition,
      description: currentWeather.description,
      icon: currentWeather.icon,
      humidity: 0, // Open-Meteo free tier doesn't provide humidity
      wind_speed: 0,
      pressure: 0,
      visibility: 10,
      timezone: 0,
      coord: { lat, lon },
      main: { temp: currentWeather.temp, feels_like: currentWeather.temp },
      weather: [{ main: currentWeather.condition, description: currentWeather.description, icon: currentWeather.icon }],
    },
    forecast: dailyData.slice(0, 5),
    hourly: hourlyData.slice(0, 24), // 24 hours!
    resolvedPlace: { name: 'Current Location', lat, lon }
  }
}

// Get weather by city name
export async function getWeatherByCity(city, units = 'metric') {
  const coords = await getCoordinates(city)
  const weather = await getWeatherByCoords(coords.lat, coords.lon, units)
  return {
    ...weather,
    resolvedPlace: { 
      name: coords.name, 
      state: coords.state, 
      country: coords.country,
      lat: coords.lat,
      lon: coords.lon 
    }
  }
}

// Search cities for autocomplete
export async function searchCities(query) {
  if (!query || query.length < 2) return []
  
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  if (!data.results) return []
  
  return data.results.map((place) => ({
    name: place.name,
    state: place.admin1 || '',
    country: place.country,
    lat: place.latitude,
    lon: place.longitude,
    display: `${place.name}${place.admin1 ? `, ${place.admin1}` : ''}, ${place.country}`
  }))
}
