import { NextRequest } from 'next/server'
import { parseCommand } from '@/lib/commands'

export async function POST(request: NextRequest) {
  const { input } = await request.json()
  const parsed = parseCommand(input || '')
  if (!parsed) return Response.json({ error: 'Unknown command' }, { status: 400 })
  return Response.json(parsed)
}
