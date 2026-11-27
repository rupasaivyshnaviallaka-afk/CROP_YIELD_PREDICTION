import { NextResponse } from 'next/server'

export async function GET() {
  const modelUrl = process.env.CROP_MODEL_API_URL?.replace(/\/$/, '')
  if (!modelUrl) return NextResponse.json({ status: 'offline', configured: false }, { headers: { 'Cache-Control': 'no-store' } })

  try {
    const response = await fetch(`${modelUrl}/api/health`, {
      headers: process.env.CROP_MODEL_API_KEY ? { Authorization: `Bearer ${process.env.CROP_MODEL_API_KEY}` } : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return NextResponse.json({ status: 'offline', configured: true }, { headers: { 'Cache-Control': 'no-store' } })
    const health = await response.json().catch(() => ({}))
    return NextResponse.json({ ...health, status: 'ok', configured: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ status: 'offline', configured: true }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
