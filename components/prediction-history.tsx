'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRight, Clock3, Sprout } from 'lucide-react'

type RecordRow = {
  id: string
  state: string
  district: string
  crop: string
  season: string
  year: number
  result: Record<string, unknown>
  createdAt: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Unable to load your saved predictions.')
  return response.json() as Promise<RecordRow[]>
}

function predictionValue(result: Record<string, unknown>) {
  const value = result.prediction ?? result.yield ?? result.predicted_yield
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  return 'Prediction saved'
}

export function PredictionHistory() {
  const { data, error, isLoading } = useSWR('/api/predictions', fetcher)

  return (
    <section className="panel history-panel">
      <div className="panel-head"><div><h2>Your prediction history</h2><p>Saved to your account and visible only to you.</p></div></div>
      {isLoading && <p className="history-state">Loading saved predictions…</p>}
      {error && <div className="history-state"><p>{error.message}</p><Link href="/sign-in" className="button button-primary">Sign in</Link></div>}
      {data?.length === 0 && <div className="history-state"><div className="weather-icon"><Sprout size={20}/></div><strong>No saved predictions yet</strong><p>Your predictions will appear here after you run them while signed in.</p><Link href="/predict" className="button button-outline">Make a prediction <ArrowRight size={14}/></Link></div>}
      {data && data.length > 0 && <div className="history-list">{data.map((item) => <article className="history-row" key={item.id}><div className="weather-icon"><Sprout size={18}/></div><div className="history-detail"><strong>{item.crop} · {item.district}, {item.state}</strong><span>{item.season} {item.year} · {new Date(item.createdAt).toLocaleString()}</span></div><div className="history-result"><b>{predictionValue(item.result)}</b><small>{String(item.result.unit ?? 'model output')}</small></div></article>)}</div>}
      {!isLoading && !error && data && data.length > 0 && <p className="history-footnote"><Clock3 size={13}/> Showing your latest {data.length} saved results</p>}
    </section>
  )
}
