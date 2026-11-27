import { NextResponse } from 'next/server'
import { z } from 'zod'
import { districtsByState } from '@/lib/india-districts'

const querySchema = z.object({ state: z.string().min(2).max(80), district: z.string().min(2).max(100) })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ state: searchParams.get('state'), district: searchParams.get('district') })
  if (!parsed.success) return NextResponse.json({ error: 'Choose a valid state and district.' }, { status: 400 })

  const { state, district } = parsed.data
  if (!districtsByState[state]?.includes(district)) {
    return NextResponse.json({ error: 'That district does not belong to the selected state.' }, { status: 400 })
  }

  try {
    const locationUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
    locationUrl.search = new URLSearchParams({ name: `${district}, ${state}`, count: '10', language: 'en', format: 'json' }).toString()
    const locationResponse = await fetch(locationUrl, { cache: 'no-store', signal: AbortSignal.timeout(7000) })
    if (!locationResponse.ok) throw new Error('Location lookup is unavailable.')
    const locationData = (await locationResponse.json()) as { results?: Array<{ name: string; country_code: string; admin1?: string; latitude: number; longitude: number }> }
    const normalizedState = state.toLocaleLowerCase()
    const location = locationData.results?.find((place) =>
      place.country_code === 'IN' &&
      place.name.toLocaleLowerCase() === district.toLocaleLowerCase() &&
      place.admin1?.toLocaleLowerCase().includes(normalizedState),
    )

    if (!location) return NextResponse.json({ error: 'Live weather is not available for this district yet.' }, { status: 404 })

    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast')
    weatherUrl.search = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto',
      forecast_days: '1',
    }).toString()
    const weatherResponse = await fetch(weatherUrl, { cache: 'no-store', signal: AbortSignal.timeout(7000) })
    if (!weatherResponse.ok) throw new Error('Live weather is temporarily unavailable.')
    const weather = await weatherResponse.json()

    return NextResponse.json({
      location: { state, district },
      current: weather.current,
      units: weather.current_units,
      attribution: 'Open-Meteo',
      fetchedAt: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Live weather is temporarily unavailable.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
