import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET() {
  const db = getDb()

  const items = db.prepare(`
    SELECT metric, scope, value, unit, updated_at FROM cache_server_metrics
  `).all() as { metric: string; scope: string; value: number; unit: string; updated_at: number }[]

  const lastRun = db.prepare(`
    SELECT run_ts, status, written, error FROM server_metrics_log
    ORDER BY id DESC LIMIT 1
  `).get() as { run_ts: number; status: string; written: number; error: string | null } | undefined

  return NextResponse.json({ items, lastRun: lastRun ?? null })
}
