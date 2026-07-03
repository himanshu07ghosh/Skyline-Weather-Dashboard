// Open-Meteo API + OpenWeatherMap Combined
// Open-Meteo: Free, no API key, gives 24-hour forecast
// OpenWeatherMap: Gives wind, humidity, pressure, sunrise/sunset

const OPENWEATHER_KEY = import.meta.env.VITE_OWM_API_KEY
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5'
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

// Get city coordinates
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

// Get city name from coordinates (for location button)
async function getCityNameFromCoords(lat, lon) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) return 'Current Location'
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return result.name || 'Current Location'
    }
    return 'Current Location'
  } catch (error) {
    return 'Current Location'
  }
}

// Get current weather details from OpenWeatherMap (wind, humidity, pressure, sunrise, sunset)
async function getCurrentWeatherDetails(lat, lon, units = 'metric') {
  try {
    if (!OPENWEATHER_KEY) {
      // If no OpenWeatherMap key, return empty data
      return {
        wind: { speed: 0 },
        main: { humidity: 0, pressure: 0 },
        sys: { sunrise: 0, sunset: 0 },
        name: 'Current Location',
        timezone: 0,
        visibility: 10000,
        coord: { lat, lon }
      }
    }
    
    const url = `${OPENWEATHER_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Could not fetch weather details')
    return await res.json()
  } catch (error) {
    return {
      wind: { speed: 0 },
      main: { humidity: 0, pressure: 0 },
      sys: { sunrise: 0, sunset: 0 },
      name: 'Current Location',
      timezone: 0,
      visibility: 10000,
      coord: { lat, lon }
    }
  }
}

// Get weather by coordinates
export async function getWeatherByCoords(lat, lon, units = 'metric') {
  const unit = units === 'metric' ? 'celsius' : 'fahrenheit'
  
  // Get Open-Meteo data (24-hour forecast)
  const meteoUrl = `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&hourly=temperature_2m,precipitation_probability,weathercode&timezone=auto&forecast_days=5&temperature_unit=${unit}`
  
  const meteoRes = await fetch(meteoUrl)
  if (!meteoRes.ok) throw new Error('Could not fetch weather data.')
  const meteoData = await meteoRes.json()

  // Get OpenWeatherMap current details (wind, humidity, pressure, sunrise, sunset)
  const weatherDetails = await getCurrentWeatherDetails(lat, lon, units)

  // Get city name
  const cityName = await getCityNameFromCoords(lat, lon)

  // Build 24-hour forecast
  const hourlyData = meteoData.hourly.time.map((time, i) => {
    const date = new Date(time)
    const weather = getWeatherInfo(meteoData.hourly.weathercode[i])
    return {
      time: date,
      hour: date.getHours(),
      temp: Math.round(meteoData.hourly.temperature_2m[i]),
      condition: weather.condition,
      description: weather.condition.toLowerCase(),
      icon: weather.icon,
      pop: meteoData.hourly.precipitation_probability[i] || 0,
    }
  })

  // Get current weather (find the closest hour to now)
  const now = new Date()
  const currentHour = now.getHours()
  let currentWeather = hourlyData.find(h => h.hour === currentHour)
  if (!currentWeather) {
    currentWeather = hourlyData[0]
  }

  // Build 5-day forecast
  const dailyData = meteoData.daily.time.map((time, i) => {
    const weather = getWeatherInfo(meteoData.daily.weathercode[i])
    return {
      date: time,
      max: Math.round(meteoData.daily.temperature_2m_max[i]),
      min: Math.round(meteoData.daily.temperature_2m_min[i]),
      condition: weather.condition,
      description: weather.condition.toLowerCase(),
      icon: weather.icon,
      pop: Math.round(meteoData.daily.precipitation_probability_max[i] || 0),
    }
  })

  return {
    current: {
      name: weatherDetails.name || cityName || 'Current Location',
      temp: currentWeather.temp,
      feels_like: currentWeather.temp,
      condition: currentWeather.condition,
      description: currentWeather.description,
      icon: currentWeather.icon,
      humidity: weatherDetails.main?.humidity || 0,
      wind_speed: weatherDetails.wind?.speed || 0,
      pressure: weatherDetails.main?.pressure || 0,
      visibility: weatherDetails.visibility || 10000,
      timezone: weatherDetails.timezone || 0,
      coord: { lat, lon },
      main: { 
        temp: currentWeather.temp, 
        feels_like: currentWeather.temp,
        temp_min: currentWeather.temp,
        temp_max: currentWeather.temp,
        humidity: weatherDetails.main?.humidity || 0,
        pressure: weatherDetails.main?.pressure || 0
      },
      weather: [{ 
        main: currentWeather.condition, 
        description: currentWeather.description, 
        icon: currentWeather.icon 
      }],
      wind: { speed: weatherDetails.wind?.speed || 0 },
      sys: { 
        sunrise: weatherDetails.sys?.sunrise || 0, 
        sunset: weatherDetails.sys?.sunset || 0 
      }
    },
    forecast: dailyData.slice(0, 5),
    hourly: hourlyData.slice(0, 24),
    resolvedPlace: { 
      name: weatherDetails.name || cityName || 'Current Location', 
      lat, 
      lon 
    }
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
