import { syncServerMetrics } from '@/lib/server-metrics'

export async function POST() {
  await syncServerMetrics()
  return Response.json({ success: true })
}
