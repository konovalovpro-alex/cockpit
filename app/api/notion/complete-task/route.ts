import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { page_id } = await request.json()
  if (!page_id) return Response.json({ ok: false, error: 'page_id required' }, { status: 400 })

  const token = process.env.NOTION_TOKEN
  const statusField = process.env.NOTION_STATUS_FIELD || 'Статус'
  const statusDone = process.env.NOTION_STATUS_DONE || 'Готово'

  const res = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      properties: {
        [statusField]: { select: { name: statusDone } },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return Response.json({ ok: false, error: err }, { status: 500 })
  }

  return Response.json({ ok: true })
}
