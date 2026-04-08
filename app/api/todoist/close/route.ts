import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { task_id } = await request.json()
  if (!task_id) return Response.json({ ok: false, error: 'task_id required' }, { status: 400 })

  const token = process.env.TODOIST_TOKEN
  const res = await fetch(`https://api.todoist.com/rest/v2/tasks/${task_id}/close`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return Response.json({ ok: false, error: `Todoist API ${res.status}` }, { status: 500 })
  }

  // Remove from cache
  try {
    const db = getDb()
    const cached = db.prepare(`SELECT data FROM cache_todoist_today WHERE id = 1`).get() as { data: string } | undefined
    if (cached) {
      const tasks = JSON.parse(cached.data)
      const updated = tasks.filter((t: { id: string }) => t.id !== task_id)
      db.prepare(`UPDATE cache_todoist_today SET data = ? WHERE id = 1`).run(JSON.stringify(updated))
    }
  } catch {}

  return Response.json({ ok: true })
}
