import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

// GET — задачи из кэша
export async function GET() {
  const db = getDb()
  const row = db.prepare(`SELECT data, updated_at FROM cache_notion_tasks ORDER BY id DESC LIMIT 1`).get() as
    | { data: string; updated_at: string }
    | undefined
  if (!row) return Response.json({ tasks: [], updated_at: null })
  return Response.json({ tasks: JSON.parse(row.data), updated_at: row.updated_at })
}

// POST — создать заметку в Notion inbox
export async function POST(request: NextRequest) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const NOTION_INBOX_ID = process.env.NOTION_INBOX_ID

  if (!NOTION_TOKEN || !NOTION_INBOX_ID) {
    return Response.json({ error: 'Notion not configured' }, { status: 503 })
  }

  const { text } = await request.json()
  if (!text) return Response.json({ error: 'text is required' }, { status: 400 })

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_INBOX_ID },
      properties: {
        title: {
          title: [{ type: 'text', text: { content: text } }],
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return Response.json({ error: err }, { status: res.status })
  }

  return Response.json({ success: true })
}
