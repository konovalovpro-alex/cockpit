import { getDb } from '@/lib/db'

// Called once on server start via instrumentation
export async function GET() {
  getDb() // triggers migration
  return Response.json({ status: 'ok' })
}
