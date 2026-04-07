import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const { name, description, icon, sort_order, link_ids } = await request.json()

  db.prepare(`
    UPDATE spaces SET name=?, description=?, icon=?, sort_order=? WHERE id=?
  `).run(name, description || null, icon || null, sort_order ?? 0, Number(id))

  if (link_ids !== undefined) {
    db.prepare(`DELETE FROM space_links WHERE space_id = ?`).run(Number(id))
    ;(link_ids as number[]).forEach((linkId, idx) => {
      db.prepare(`INSERT INTO space_links (space_id, link_id, sort_order) VALUES (?, ?, ?)`).run(Number(id), linkId, idx)
    })
  }

  const space = db.prepare(`SELECT * FROM spaces WHERE id = ?`).get(Number(id))
  return Response.json(space)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  db.prepare(`DELETE FROM spaces WHERE id = ?`).run(Number(id))
  return Response.json({ success: true })
}
