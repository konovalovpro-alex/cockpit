import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  const db = getDb()
  const body = await request.json()
  const { id, url, name, description, icon, color, is_pinned, sort_order, created_at, tags, spaceIds } = body

  if (!id || !url || !name) {
    return Response.json({ error: 'id, url and name are required' }, { status: 400 })
  }

  const restore = db.transaction(() => {
    db.prepare(`
      INSERT INTO links (id, url, name, description, icon, color, is_pinned, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, url, name, description || null, icon || null, color || null, is_pinned ? 1 : 0, sort_order || 0, created_at || null)

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        const tagName = typeof tag === 'string' ? tag : tag.name
        let existing = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(tagName) as { id: number } | undefined
        if (!existing) {
          const r = db.prepare(`INSERT INTO tags (name) VALUES (?)`).run(tagName)
          existing = { id: r.lastInsertRowid as number }
        }
        db.prepare(`INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)`).run(id, existing.id)
      }
    }

    if (spaceIds && Array.isArray(spaceIds)) {
      for (const spaceId of spaceIds) {
        db.prepare(`INSERT OR IGNORE INTO space_links (space_id, link_id) VALUES (?, ?)`).run(spaceId, id)
      }
    }
  })

  restore()
  return Response.json({ ok: true })
}
