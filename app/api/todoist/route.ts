import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

// GET — задачи из кэша
export async function GET() {
  const db = getDb()
  const row = db.prepare(`SELECT data, updated_at FROM cache_todoist_today ORDER BY id DESC LIMIT 1`).get() as
    | { data: string; updated_at: string }
    | undefined
  if (!row) return Response.json({ tasks: [], updated_at: null })
  return Response.json({ tasks: JSON.parse(row.data), updated_at: row.updated_at })
}

// POST — создать задачу в Todoist
export async function POST(request: NextRequest) {
  const TODOIST_TOKEN = process.env.TODOIST_TOKEN
  if (!TODOIST_TOKEN) return Response.json({ error: 'Todoist not configured' }, { status: 503 })

  const { content } = await request.json()
  if (!content) return Response.json({ error: 'content is required' }, { status: 400 })

  const res = await fetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TODOIST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    const err = await res.text()
    return Response.json({ error: err }, { status: res.status })
  }

  const task = await res.json()
  return Response.json(task, { status: 201 })
}
