import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to connect to Neon.')
}

const globalForDb = globalThis as typeof globalThis & { cropYieldPool?: Pool }

export const pool = globalForDb.cropYieldPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

if (process.env.NODE_ENV !== 'production') globalForDb.cropYieldPool = pool

export const db = drizzle(pool, { schema })
