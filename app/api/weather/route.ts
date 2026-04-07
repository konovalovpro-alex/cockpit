import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const row = db.prepare(`SELECT data, updated_at FROM cache_weather ORDER BY id DESC LIMIT 1`).get() as
    | { data: string; updated_at: string }
    | undefined
  if (!row) return Response.json({ weather: null, updated_at: null })
  return Response.json({ weather: JSON.parse(row.data), updated_at: row.updated_at })
}
