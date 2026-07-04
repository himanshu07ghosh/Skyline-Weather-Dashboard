# Skyline — Weather Dashboard

A real-time weather dashboard built as an internship project. Search any city,
use your current location, and see live conditions plus a 5-day forecast —
default home city is **Dehradun, Uttarakhand**. Fully responsive for phone
and laptop.

---

## Live Links :-

Deployed Live Project : [Live Link 🔗🔗](https://skyline-weather-app-himanshughosh.vercel.app/)

---

## 📱 Android App

Download the latest APK for Android:

[📥 Download Skyline Weather APK v1.0.0](https://github.com/himanshu07ghosh/skyline-weather-app/releases/download/v1.0.0/app-release.apk)


---


## Tech stack

| Layer            | Choice                                             |
|-------------------|-----------------------------------------------------|
| UI library         | React 18                                            |
| Build tool         | Vite 5                                              |
| Language           | JavaScript (JSX)                                    |
| Styling            | Plain CSS3 (custom properties, no framework)         |
| Markup              | Semantic HTML5                                      |
| Weather API        | OpenWeatherMap (Current Weather, 5 Day Forecast, Geocoding) |
| Fonts               | Space Grotesk, Inter, JetBrains Mono (Google Fonts)  |
| Hosting (frontend) | Vercel                                              |
| Version control    | Git + GitHub                                        |

This project intentionally uses **plain CSS instead of a framework** like
Tailwind or Bootstrap, so every style rule is visible and easy to explain in
an internship review.

---

## Project structure

```
weather-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── weather.js        # All OpenWeatherMap API calls
│   ├── components/
│   │   ├── SearchBar.jsx
│   │   ├── CurrentWeather.jsx
│   │   ├── Forecast.jsx
│   │   └── WeatherIcon.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── .gitignore
```

---

## 1. Get an API key (free)

1. Go to <https://home.openweathermap.org/users/sign_up> and create a free account.
2. Once signed in, go to **API keys** in your account and copy the default key.
   New keys can take **10–30 minutes** to activate, so do this step first.
3. This project uses three free OpenWeatherMap endpoints:
   - `/data/2.5/weather` — current conditions
   - `/data/2.5/forecast` — 5 day / 3 hour forecast (used to build the daily outlook)
   - `/geo/1.0/direct` — turns a city name you type into coordinates

## 2. Run it locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
# unzip the project, then inside the folder:
npm install

# copy the env template and paste your key in
cp .env.example .env
```

Open `.env` and set:

```
VITE_OWM_API_KEY=your_actual_key_here
```

Then start the dev server:

```bash
npm run dev
```

Open the URL VS Code / the terminal prints (usually `http://localhost:5173`).

> **Note (Windows / PowerShell):** if `cp` doesn't work, just duplicate
> `.env.example`, rename the copy to `.env`, and edit it in VS Code.

### Environment variable reference

| Variable            | Required | Description                                   |
|----------------------|----------|------------------------------------------------|
| `VITE_OWM_API_KEY`   | Yes      | Your OpenWeatherMap API key. Must be prefixed with `VITE_` so Vite exposes it to the frontend. |

The `.env` file is already listed in `.gitignore` so your key is never committed.

---

## 3. Push it to GitHub

```bash
git init
git add .
git commit -m "Initial commit: weather dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/weather-dashboard.git
git push -u origin main
```

Create the empty repo on GitHub first (github.com → New repository →
don't initialize with a README, since you already have one) and copy its
URL into the `git remote add` command above.

---

## 4. Deploy on Vercel

**Option A — Vercel dashboard (easiest)**

1. Go to <https://vercel.com> and sign in with your GitHub account.
2. Click **Add New → Project**, then select your `weather-dashboard` repo.
3. Vercel auto-detects Vite. Leave the build settings as-is:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Before clicking Deploy, open **Environment Variables** and add:
   - Key: `VITE_OWM_API_KEY`
   - Value: your OpenWeatherMap key
5. Click **Deploy**. You'll get a live `.vercel.app` URL in about a minute.

**Option B — Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel            # first deploy, follow the prompts
vercel env add VITE_OWM_API_KEY   # paste your key when asked
vercel --prod     # deploy to production
```

Any time you push new commits to `main`, Vercel redeploys automatically.

---

## Features

- Live search for any city worldwide, with the closest match auto-selected
- "Locate me" button using the browser Geolocation API
- °C / °F toggle
- 5-day forecast collapsed from 3-hour data into daily highs/lows
- Custom SVG weather icons (no external icon dependency)
- Background gradient on the hero card shifts tone with the actual condition
  (clear, cloudy, rain, storm, snow, mist)
- Fully responsive: single column on phones, two-zone grid on laptop/desktop
- Loading skeleton + friendly error banner if the API call fails

## Possible extensions for a stronger submission

- Hourly forecast chart (e.g. with a lightweight charting library)
- Recent-searches list saved to `localStorage`
- Dark mode toggle
- Air quality index panel (OpenWeatherMap has a free AQI endpoint too)
