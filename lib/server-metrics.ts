import { getDb } from './db'

const NETDATA_URL = process.env.NETDATA_URL || 'http://host.docker.internal:19999'

interface NetdataData {
  labels: string[]
  data: number[][]
}

interface MetricRow {
  metric: string
  scope: string
  value: number
  unit: string
}

async function fetchChart(chart: string): Promise<NetdataData | null> {
  try {
    const res = await fetch(
      `${NETDATA_URL}/api/v1/data?chart=${encodeURIComponent(chart)}&after=-60&points=1&group=average&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function val(labels: string[], data: number[][], name: string): number | null {
  const idx = labels.indexOf(name)
  if (idx < 0 || !data[0] || data[0][idx] === undefined) return null
  return data[0][idx]
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

async function collectCpu(): Promise<MetricRow[]> {
  const d = await fetchChart('system.cpu')
  if (!d) return []

  // Newer Netdata: no "idle" dimension — all shown dimensions ARE the usage
  const idle = val(d.labels, d.data, 'idle')
  let cpuPct: number
  if (idle !== null) {
    cpuPct = 100 - idle
  } else {
    // Sum all non-time dimensions
    const sum = d.labels.slice(1).reduce((acc, label, i) => {
      const v = d.data[0]?.[i + 1] ?? 0
      return acc + Math.abs(v)
    }, 0)
    cpuPct = sum
  }
  return [{ metric: 'cpu_percent', scope: '', value: round2(Math.min(cpuPct, 100)), unit: '%' }]
}

async function collectLoad(): Promise<MetricRow[]> {
  const d = await fetchChart('system.load')
  if (!d) return []
  const rows: MetricRow[] = []
  for (const dim of ['load1', 'load5', 'load15']) {
    const v = val(d.labels, d.data, dim)
    if (v !== null) rows.push({ metric: dim, scope: '', value: round2(v), unit: '' })
  }
  return rows
}

async function collectRam(): Promise<MetricRow[]> {
  const d = await fetchChart('system.ram')
  if (!d) return []
  // Values in MiB
  const used = val(d.labels, d.data, 'used') ?? 0
  const free = val(d.labels, d.data, 'free') ?? 0
  const cached = val(d.labels, d.data, 'cached') ?? 0
  const buffers = val(d.labels, d.data, 'buffers') ?? 0
  const total = used + free + cached + buffers
  if (total === 0) return []
  return [
    { metric: 'ram_percent', scope: '', value: round2((used / total) * 100), unit: '%' },
    { metric: 'ram_used_gib', scope: '', value: round2(used / 1024), unit: 'GiB' },
    { metric: 'ram_total_gib', scope: '', value: round2(total / 1024), unit: 'GiB' },
  ]
}

async function collectSwap(): Promise<MetricRow[]> {
  const d = await fetchChart('mem.swap')
  if (!d) return []
  const used = val(d.labels, d.data, 'used') ?? 0
  const free = val(d.labels, d.data, 'free') ?? 0
  const total = used + free
  if (total === 0) return [{ metric: 'swap_percent', scope: '', value: 0, unit: '%' }]
  return [{ metric: 'swap_percent', scope: '', value: round2((used / total) * 100), unit: '%' }]
}

async function collectNetwork(): Promise<MetricRow[]> {
  const d = await fetchChart('system.net')
  if (!d) return []
  const rows: MetricRow[] = []
  // Values in kilobits/s; sent is negative (outbound)
  const received = val(d.labels, d.data, 'received')
  const sent = val(d.labels, d.data, 'sent')
  if (received !== null) rows.push({ metric: 'net_in_mbps', scope: '', value: round2(Math.abs(received) / 1000), unit: 'Mbps' })
  if (sent !== null) rows.push({ metric: 'net_out_mbps', scope: '', value: round2(Math.abs(sent) / 1000), unit: 'Mbps' })
  return rows
}

function chartToMount(chart: string): string {
  // disk_space./ → /    disk_space./boot → /boot
  return chart.replace('disk_space.', '') || '/'
}

async function discoverDiskCharts(): Promise<string[]> {
  try {
    const res = await fetch(`${NETDATA_URL}/api/v1/charts`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return ['disk_space./']
    const body = await res.json()
    const charts: string[] = Object.keys(body.charts ?? {}).filter((c: string) => c.startsWith('disk_space.'))
    return charts.length > 0 ? charts : ['disk_space./']
  } catch {
    return ['disk_space./']
  }
}

async function collectDisks(): Promise<MetricRow[]> {
  const diskCharts = await discoverDiskCharts()
  const rows: MetricRow[] = []

  for (const chart of diskCharts) {
    const mount = chartToMount(chart)
    const d = await fetchChart(chart)
    if (!d) continue

    // Values in GiB; "reserved for root" label has spaces
    const used = val(d.labels, d.data, 'used') ?? 0
    const avail = val(d.labels, d.data, 'avail') ?? 0
    const reserved = val(d.labels, d.data, 'reserved for root') ?? 0
    const total = used + avail + reserved
    if (total === 0) continue

    rows.push({ metric: 'disk_used_percent', scope: mount, value: round2((used / total) * 100), unit: '%' })
    rows.push({ metric: 'disk_used_gib', scope: mount, value: round2(used), unit: 'GiB' })
    rows.push({ metric: 'disk_total_gib', scope: mount, value: round2(total), unit: 'GiB' })

    const inodeChart = chart.replace('disk_space.', 'disk_inodes.')
    const inodesD = await fetchChart(inodeChart)
    if (inodesD) {
      const iUsed = val(inodesD.labels, inodesD.data, 'used') ?? 0
      const iAvail = val(inodesD.labels, inodesD.data, 'avail') ?? 0
      const iTotal = iUsed + iAvail
      if (iTotal > 0) rows.push({ metric: 'inode_used_percent', scope: mount, value: round2((iUsed / iTotal) * 100), unit: '%' })
    }
  }

  return rows
}

export async function syncServerMetrics(): Promise<void> {
  const db = getDb()
  const runTs = Date.now()

  let metrics: MetricRow[] = []
  let errorMsg: string | undefined

  try {
    const [cpu, load, ram, swap, net, disks] = await Promise.all([
      collectCpu(),
      collectLoad(),
      collectRam(),
      collectSwap(),
      collectNetwork(),
      collectDisks(),
    ])
    metrics = [...cpu, ...load, ...ram, ...swap, ...net, ...disks]
  } catch (e) {
    errorMsg = String(e)
  }

  if (metrics.length === 0 && !errorMsg) errorMsg = 'Netdata returned no metrics'

  if (metrics.length > 0) {
    const upsert = db.prepare(`
      INSERT INTO cache_server_metrics (metric, scope, value, unit, updated_at)
      VALUES (@metric, @scope, @value, @unit, @updated_at)
      ON CONFLICT(metric, scope) DO UPDATE SET
        value      = excluded.value,
        unit       = excluded.unit,
        updated_at = excluded.updated_at
    `)
    const insert = db.prepare(`
      INSERT INTO server_metrics_history (ts, metric, scope, value)
      VALUES (@ts, @metric, @scope, @value)
    `)
    const ts = Math.floor(runTs / 1000)

    db.transaction(() => {
      for (const m of metrics) {
        upsert.run({ ...m, updated_at: runTs })
        insert.run({ ts, metric: m.metric, scope: m.scope, value: m.value })
      }
    })()
  }

  db.prepare(`
    INSERT INTO server_metrics_log (run_ts, status, written, error)
    VALUES (?, ?, ?, ?)
  `).run(runTs, errorMsg ? 'error' : 'ok', metrics.length, errorMsg ?? null)

  if (errorMsg) {
    console.error('[cron] server metrics error:', errorMsg)
  } else {
    console.log(`[cron] server metrics synced: ${metrics.length} rows`)
  }
}

export async function pruneServerMetricsHistory(): Promise<void> {
  const db = getDb()
  const cutoff = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
  const { changes } = db.prepare(`DELETE FROM server_metrics_history WHERE ts < ?`).run(cutoff)
  if (changes > 0) console.log(`[cron] server metrics history pruned: ${changes} rows`)
}
