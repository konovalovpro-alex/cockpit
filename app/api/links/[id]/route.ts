import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const link = db.prepare(`SELECT * FROM links WHERE id = ?`).get(Number(id))
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })
  const tags = db.prepare(`
    SELECT t.* FROM tags t JOIN link_tags lt ON t.id = lt.tag_id WHERE lt.link_id = ?
  `).all(Number(id))
  return Response.json({ ...link, tags })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const body = await request.json()
  const { url, name, description, icon, color, is_pinned, sort_order, tags } = body

  db.prepare(`
    UPDATE links SET url=?, name=?, description=?, icon=?, color=?, is_pinned=?, sort_order=?
    WHERE id=?
  `).run(url, name, description || null, icon || null, color || null, is_pinned ? 1 : 0, sort_order ?? 0, Number(id))

  if (tags !== undefined) {
    db.prepare(`DELETE FROM link_tags WHERE link_id = ?`).run(Number(id))
    for (const tagName of tags) {
      let tag = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(tagName) as { id: number } | undefined
      if (!tag) {
        const r = db.prepare(`INSERT INTO tags (name) VALUES (?)`).run(tagName)
        tag = { id: r.lastInsertRowid as number }
      }
      db.prepare(`INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)`).run(Number(id), tag.id)
    }
  }

  const link = db.prepare(`SELECT * FROM links WHERE id = ?`).get(Number(id))
  return Response.json(link)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()

  const link = db.prepare(`SELECT * FROM links WHERE id = ?`).get(Number(id))
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })

  const tags = db.prepare(`
    SELECT t.* FROM tags t JOIN link_tags lt ON t.id = lt.tag_id WHERE lt.link_id = ?
  `).all(Number(id)) as { id: number; name: string; color?: string }[]

  const spaceRows = db.prepare(`SELECT space_id FROM space_links WHERE link_id = ?`).all(Number(id)) as { space_id: number }[]
  const spaceIds = spaceRows.map((r) => r.space_id)

  db.prepare(`DELETE FROM links WHERE id = ?`).run(Number(id))

  return Response.json({ ok: true, deletedLink: { ...(link as object), tags, spaceIds } })
}
