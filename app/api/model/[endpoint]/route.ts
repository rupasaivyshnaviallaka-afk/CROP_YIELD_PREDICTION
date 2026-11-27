import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function forward(request: NextRequest, endpoint: string) {
  if (!['health', 'predict'].includes(endpoint)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const configuredUrl = process.env.CROP_MODEL_API_URL
  const baseUrl = configuredUrl
    ? configuredUrl.replace(/\/$/, '')
    : request.nextUrl.origin
  const headers = new Headers({ Accept: 'application/json' })
  const apiKey = process.env.CROP_MODEL_API_KEY
  if (apiKey) headers.set('X-API-Key', apiKey)

  let body: string | undefined
  if (request.method === 'POST') {
    headers.set('Content-Type', 'application/json')
    body = await request.text()
  }

  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
    const responseBody = await response.text()
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ error: 'The crop model API is unavailable.' }, { status: 502 })
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  const { endpoint } = await context.params
  return forward(request, endpoint)
}

export async function POST(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  const { endpoint } = await context.params
  return forward(request, endpoint)
}
