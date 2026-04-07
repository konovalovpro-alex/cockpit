import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const db = getDb()
  const { searchParams } = request.nextUrl
  const tagId = searchParams.get('tag')
  const pinned = searchParams.get('pinned')

  let links: unknown[]

  if (pinned === '1') {
    links = db.prepare(`
      SELECT * FROM links WHERE is_pinned = 1 ORDER BY sort_order ASC
    `).all()
  } else if (tagId) {
    links = db.prepare(`
      SELECT l.* FROM links l
      JOIN link_tags lt ON l.id = lt.link_id
      WHERE lt.tag_id = ?
      ORDER BY l.sort_order ASC
    `).all(tagId)
  } else {
    links = db.prepare(`SELECT * FROM links ORDER BY sort_order ASC`).all()
  }

  // Attach tags to each link
  const linksWithTags = (links as { id: number; [key: string]: unknown }[]).map((link) => {
    const tags = db.prepare(`
      SELECT t.* FROM tags t
      JOIN link_tags lt ON t.id = lt.tag_id
      WHERE lt.link_id = ?
    `).all(link.id)
    return { ...link, tags }
  })

  return Response.json(linksWithTags)
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const body = await request.json()
  const { url, name, description, icon, color, is_pinned, sort_order, tags } = body

  if (!url || !name) {
    return Response.json({ error: 'url and name are required' }, { status: 400 })
  }

  const result = db.prepare(`
    INSERT INTO links (url, name, description, icon, color, is_pinned, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(url, name, description || null, icon || null, color || null, is_pinned ? 1 : 0, sort_order || 0)

  const linkId = result.lastInsertRowid as number

  if (tags && Array.isArray(tags)) {
    for (const tagName of tags) {
      let tag = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(tagName) as { id: number } | undefined
      if (!tag) {
        const r = db.prepare(`INSERT INTO tags (name) VALUES (?)`).run(tagName)
        tag = { id: r.lastInsertRowid as number }
      }
      db.prepare(`INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)`).run(linkId, tag.id)
    }
  }

  const link = db.prepare(`SELECT * FROM links WHERE id = ?`).get(linkId)
  return Response.json(link, { status: 201 })
}
