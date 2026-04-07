import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const tags = db.prepare(`SELECT * FROM tags ORDER BY name ASC`).all()
  return Response.json(tags)
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const { name, color } = await request.json()
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  const result = db.prepare(`INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)`).run(name, color || null)
  const tag = db.prepare(`SELECT * FROM tags WHERE id = ?`).get(result.lastInsertRowid)
  return Response.json(tag, { status: 201 })
}
