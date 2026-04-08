import { getDb } from '@/lib/db'
import { NextRequest } from 'next/server'

const VALID_PRESETS = ['today', 'p1', 'inbox', 'week', 'all'] as const
type Preset = typeof VALID_PRESETS[number]
const TABLE: Record<Preset, string> = {
  today: 'cache_todoist_today',
  p1:    'cache_todoist_p1',
  inbox: 'cache_todoist_inbox',
  week:  'cache_todoist_week',
  all:   'cache_todoist_all',
}

export async function GET(request: NextRequest) {
  const preset = (request.nextUrl.searchParams.get('preset') || 'today') as Preset
  if (!VALID_PRESETS.includes(preset)) return Response.json({ tasks: [], updated_at: null })
  const db = getDb()

  let tasks: unknown[] = []
  let updated_at: string | null = null

  if (preset === 'today') {
    const row = db.prepare(`SELECT data, updated_at FROM cache_todoist_today ORDER BY id DESC LIMIT 1`).get() as { data: string; updated_at: string } | undefined
    tasks = row?.data ? JSON.parse(row.data) : []
    updated_at = row?.updated_at || null
  } else {
    const row = db.prepare(`SELECT data, updated_at FROM ${TABLE[preset]} WHERE id = 1`).get() as { data: string; updated_at: string } | undefined
    tasks = row?.data ? JSON.parse(row.data) : []
    updated_at = row?.updated_at || null
  }

  return Response.json({ tasks, updated_at })
}
