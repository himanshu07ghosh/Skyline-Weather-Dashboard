// Small hand-built icon set so the dashboard doesn't rely on OpenWeatherMap's
// bitmap icons — keeps the visual language consistent with the rest of the UI.

function Sun(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="24" r="10" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="4"
          x2="24"
          y2="9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  )
}

function Moon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M30 6a18 18 0 1 0 12 30.5A14 14 0 0 1 30 6z"
        fill="currentColor"
      />
    </svg>
  )
}

function Cloud(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M14 34a9 9 0 0 1 1-18 12 12 0 0 1 22.9 3A8 8 0 0 1 36 34H14z"
        fill="currentColor"
      />
    </svg>
  )
}

function CloudSun(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="17" cy="16" r="7" fill="currentColor" opacity="0.75" />
      <path
        d="M16 36a9 9 0 0 1 1-18 12 12 0 0 1 22.9 3A8 8 0 0 1 38 36H16z"
        fill="currentColor"
      />
    </svg>
  )
}

function Rain(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M14 28a9 9 0 0 1 1-18 12 12 0 0 1 22.9 3A8 8 0 0 1 36 28H14z"
        fill="currentColor"
      />
      <line x1="17" y1="33" x2="14" y2="41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="25" y1="33" x2="22" y2="41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33" y1="33" x2="30" y2="41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Storm(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M14 26a9 9 0 0 1 1-18 12 12 0 0 1 22.9 3A8 8 0 0 1 36 26H14z"
        fill="currentColor"
      />
      <path d="M25 29l-6 10h6l-3 8 9-12h-6l4-6h-4z" fill="currentColor" />
    </svg>
  )
}

function Snow(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M14 26a9 9 0 0 1 1-18 12 12 0 0 1 22.9 3A8 8 0 0 1 36 26H14z"
        fill="currentColor"
      />
      {[16, 24, 32].map((x) => (
        <g key={x} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1={x} y1="31" x2={x} y2="41" />
          <line x1={x - 4} y1="33" x2={x + 4} y2="39" />
          <line x1={x + 4} y1="33" x2={x - 4} y2="39" />
        </g>
      ))}
    </svg>
  )
}

function Mist(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      {[14, 21, 28].map((y) => (
        <line key={y} x1="8" y1={y} x2="40" y2={y} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

const MAP = {
  Clear: { day: Sun, night: Moon },
  Clouds: { day: CloudSun, night: Cloud },
  Rain: { day: Rain, night: Rain },
  Drizzle: { day: Rain, night: Rain },
  Thunderstorm: { day: Storm, night: Storm },
  Snow: { day: Snow, night: Snow },
  Mist: { day: Mist, night: Mist },
  Fog: { day: Mist, night: Mist },
  Haze: { day: Mist, night: Mist },
}

export default function WeatherIcon({ condition, icon, className, size }) {
  const isNight = icon?.endsWith('n')
  const set = MAP[condition] || MAP.Clouds
  const Cmp = isNight ? set.night : set.day
  
  const style = size ? { width: size, height: size } : {}
  
  return <Cmp className={className} style={style} />
}

export function conditionToMood(condition) {
  switch (condition) {
    case 'Clear':
      return 'mood-clear'
    case 'Rain':
    case 'Drizzle':
      return 'mood-rain'
    case 'Thunderstorm':
      return 'mood-storm'
    case 'Snow':
      return 'mood-snow'
    case 'Mist':
    case 'Fog':
    case 'Haze':
      return 'mood-mist'
    default:
      return 'mood-clouds'
  }
}
