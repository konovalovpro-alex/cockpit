import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const spaces = db.prepare(`SELECT * FROM spaces ORDER BY sort_order ASC`).all()
  const spacesWithLinks = (spaces as { id: number; [key: string]: unknown }[]).map((space) => {
    const links = db.prepare(`
      SELECT l.* FROM links l
      JOIN space_links sl ON l.id = sl.link_id
      WHERE sl.space_id = ?
      ORDER BY sl.sort_order ASC
    `).all(space.id)
    return { ...space, links }
  })
  return Response.json(spacesWithLinks)
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const { name, description, icon, sort_order } = await request.json()
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  const result = db.prepare(`
    INSERT INTO spaces (name, description, icon, sort_order) VALUES (?, ?, ?, ?)
  `).run(name, description || null, icon || null, sort_order || 0)

  const space = db.prepare(`SELECT * FROM spaces WHERE id = ?`).get(result.lastInsertRowid)
  return Response.json(space, { status: 201 })
}
