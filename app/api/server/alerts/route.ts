import { NextResponse } from 'next/server'

const NETDATA_URL = process.env.NETDATA_URL || 'http://host.docker.internal:19999'

export async function GET() {
  try {
    const res = await fetch(`${NETDATA_URL}/api/v1/alarms`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return NextResponse.json({ total: 0, critical: 0, warning: 0 })
    const data = await res.json()
    const alarms = Object.values(data.alarms ?? {}) as { status: string }[]
    const critical = alarms.filter(a => a.status === 'CRITICAL').length
    const warning = alarms.filter(a => a.status === 'WARNING').length
    return NextResponse.json({ total: critical + warning, critical, warning })
  } catch {
    return NextResponse.json({ total: 0, critical: 0, warning: 0 })
  }
}
