import { getDb } from './db'

export async function syncTodoist() {
  const TODOIST_TOKEN = process.env.TODOIST_TOKEN
  if (!TODOIST_TOKEN) return

  try {
    const res = await fetch(
      `https://api.todoist.com/api/v1/tasks?filter=${encodeURIComponent('today | overdue')}`,
      { headers: { Authorization: `Bearer ${TODOIST_TOKEN}` } }
    )
    if (!res.ok) return
    const body = await res.json()
    const tasks: { project_id?: string; [key: string]: unknown }[] = body.results ?? body

    // Enrich with project names
    const projectsRes = await fetch('https://api.todoist.com/api/v1/projects', {
      headers: { Authorization: `Bearer ${TODOIST_TOKEN}` },
    })
    const projectsBody = projectsRes.ok ? await projectsRes.json() : { results: [] }
    const projects: { id: string; name: string }[] = projectsBody.results ?? projectsBody
    const projectMap: Record<string, string> = {}
    for (const p of projects) projectMap[p.id] = p.name

    const enriched = tasks.map((t) => ({
      ...t,
      project_name: t.project_id ? projectMap[t.project_id] : null,
    }))

    const db = getDb()
    db.prepare(`DELETE FROM cache_todoist_today`).run()
    db.prepare(`INSERT INTO cache_todoist_today (data) VALUES (?)`).run(JSON.stringify(enriched))
    console.log(`[cron] Todoist synced: ${enriched.length} tasks`)
  } catch (e) {
    console.error('[cron] Todoist sync error:', e)
  }
}

export async function syncNotion() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const NOTION_TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID
  if (!NOTION_TOKEN || !NOTION_TASKS_DB_ID) return

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_TASKS_DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          or: [
            { property: 'Статус', select: { equals: 'В работе' } },
            { property: 'Статус', select: { equals: 'Запланировано' } },
          ],
        },
      }),
    })
    if (!res.ok) return
    const data = await res.json()

    const tasks = data.results.map((page: {
      id: string;
      url: string;
      properties: {
        [key: string]: {
          type: string;
          title?: Array<{ plain_text: string }>;
          status?: { name: string };
          select?: { name: string };
        }
      }
    }) => {
      const titleProp = Object.values(page.properties).find((p) => p.type === 'title')
      const title = titleProp?.title?.[0]?.plain_text || 'Без названия'
      const statusProp = page.properties['Статус']
      const status = statusProp?.select?.name || ''
      return { id: page.id, title, status, url: page.url }
    })

    const db = getDb()
    db.prepare(`DELETE FROM cache_notion_tasks`).run()
    db.prepare(`INSERT INTO cache_notion_tasks (data) VALUES (?)`).run(JSON.stringify(tasks))
    console.log(`[cron] Notion synced: ${tasks.length} tasks`)
  } catch (e) {
    console.error('[cron] Notion sync error:', e)
  }
}

export async function syncWeather() {
  const lat = process.env.WEATHER_LAT || '41.0082'  // Istanbul by default
  const lon = process.env.WEATHER_LON || '28.9784'

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
    if (!res.ok) return
    const data = await res.json()
    const weather = data.current_weather

    const db = getDb()
    db.prepare(`DELETE FROM cache_weather`).run()
    db.prepare(`INSERT INTO cache_weather (data) VALUES (?)`).run(JSON.stringify(weather))
    console.log(`[cron] Weather synced: ${weather.temperature}°C`)
  } catch (e) {
    console.error('[cron] Weather sync error:', e)
  }
}
