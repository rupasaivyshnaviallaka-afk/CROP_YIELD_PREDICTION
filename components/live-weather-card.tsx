'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { CloudSun, RefreshCw, Wind } from 'lucide-react'
import { districtsByState } from '@/lib/india-districts'

type WeatherResponse = {
  location: { state: string; district: string }
  current: { temperature_2m: number; relative_humidity_2m: number; precipitation: number; weather_code: number; wind_speed_10m: number; time: string }
  units: Record<string, string>
  attribution: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Live weather is unavailable.')
  return payload as WeatherResponse
}

const conditions: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
}

export function LiveWeatherCard() {
  const [state, setState] = useState('Punjab')
  const [district, setDistrict] = useState('Ludhiana')
  const key = `/api/weather?${new URLSearchParams({ state, district })}`
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, { refreshInterval: 300000, revalidateOnFocus: true, dedupingInterval: 60000 })
  const current = data?.current

  return (
    <section className="panel weather-panel" aria-labelledby="weather-title">
      <div className="panel-head"><div><h2 id="weather-title">Live local weather</h2><p>Current conditions for your selected district · refreshes every 5 minutes</p></div><button className="icon-button" type="button" onClick={() => mutate()} aria-label="Refresh live weather"><RefreshCw size={15}/></button></div>
      <div className="weather-location">
        <label><span className="sr-only">State</span><select aria-label="Weather state" value={state} onChange={(event) => { const nextState = event.target.value; setState(nextState); setDistrict(districtsByState[nextState][0]) }}>{Object.keys(districtsByState).map((name) => <option key={name}>{name}</option>)}</select></label>
        <label><span className="sr-only">District</span><select aria-label="Weather district" value={district} onChange={(event) => setDistrict(event.target.value)}>{districtsByState[state].map((name) => <option key={name}>{name}</option>)}</select></label>
      </div>
      {isLoading && <p className="weather-state">Loading current conditions…</p>}
      {error && <p className="weather-state weather-error" role="status">{error.message}</p>}
      {current && <div className="weather-current"><div className="weather-summary"><span className="weather-icon"><CloudSun size={22}/></span><div><strong>{Math.round(current.temperature_2m)}°C</strong><span>{conditions[current.weather_code] ?? 'Current conditions'}</span></div></div><div className="weather-details"><div><span>Humidity</span><strong>{current.relative_humidity_2m}%</strong></div><div><span>Precipitation</span><strong>{current.precipitation} {data.units.precipitation}</strong></div><div><span><Wind size={12}/> Wind</span><strong>{current.wind_speed_10m} {data.units.wind_speed_10m}</strong></div></div><p className="weather-footnote">Updated {new Date(current.time).toLocaleString()} · Source: Open-Meteo</p></div>}
    </section>
  )
}
