import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { predictionHistory } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in to view your saved predictions.' }, { status: 401 })

  const records = await db
    .select({ id: predictionHistory.id, state: predictionHistory.state, district: predictionHistory.district, crop: predictionHistory.crop, season: predictionHistory.season, year: predictionHistory.year, inputs: predictionHistory.inputs, result: predictionHistory.result, createdAt: predictionHistory.createdAt })
    .from(predictionHistory)
    .where(eq(predictionHistory.userId, session.user.id))
    .orderBy(desc(predictionHistory.createdAt))
    .limit(100)

  return NextResponse.json(records, { headers: { 'Cache-Control': 'private, no-store' } })
}
