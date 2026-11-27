import { NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { predictionHistory } from '@/lib/db/schema'
import { districtsByState } from '@/lib/india-districts'

const predictionSchema = z.object({
  state: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(100),
  crop: z.string().trim().min(2).max(80),
  season: z.string().trim().min(2).max(40),
  year: z.number().int().min(1990).max(2100),
  area: z.number().positive().optional(),
  rainfall: z.number().nonnegative().optional(),
  temperature: z.number().min(-70).max(70).optional(),
}).superRefine((value, context) => {
  if (!districtsByState[value.state]?.includes(value.district)) {
    context.addIssue({ code: 'custom', path: ['district'], message: 'The district must belong to the selected state or union territory.' })
  }
})

export async function POST(request: Request) {
  const parsed = predictionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the prediction inputs and try again.' }, { status: 400 })

  const modelUrl = process.env.CROP_MODEL_API_URL?.replace(/\/$/, '')
  if (!modelUrl) return NextResponse.json({ error: 'The crop prediction model is not configured yet.' }, { status: 503 })

  try {
    const upstream = await fetch(`${modelUrl}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.CROP_MODEL_API_KEY ? { Authorization: `Bearer ${process.env.CROP_MODEL_API_KEY}` } : {}),
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
    if (!upstream.ok) return NextResponse.json({ error: 'The prediction service could not process these inputs.' }, { status: 502 })

    const result: unknown = await upstream.json()
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      return NextResponse.json({ error: 'The prediction service returned an invalid response.' }, { status: 502 })
    }

    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) {
      await db.insert(predictionHistory).values({
        userId: session.user.id,
        state: parsed.data.state,
        district: parsed.data.district,
        crop: parsed.data.crop,
        season: parsed.data.season,
        year: parsed.data.year,
        inputs: parsed.data,
        result: result as Record<string, unknown>,
      })
    }

    return NextResponse.json({ ...(result as Record<string, unknown>), historySaved: Boolean(session?.user) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'The prediction service is temporarily unavailable.' }, { status: 503 })
  }
}
