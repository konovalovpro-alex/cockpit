import { syncTodoist, syncNotion, syncWeather } from '@/lib/cron'

// Эндпоинт для ручного запуска синхронизации (и для cron-пинга)
export async function POST() {
  await Promise.all([syncTodoist(), syncNotion(), syncWeather()])
  return Response.json({ success: true })
}
