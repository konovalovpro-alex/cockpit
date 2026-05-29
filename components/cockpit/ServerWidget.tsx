'use client'

import { useEffect, useState, useCallback } from 'react'

interface MetricItem {
  metric: string
  scope: string
  value: number
  unit: string
  updated_at: number
}

interface ServerData {
  items: MetricItem[]
  lastRun: { run_ts: number; status: string; written: number; error: string | null } | null
}

interface AlertsData {
  total: number
  critical: number
  warning: number
}

function diskColor(pct: number) {
  if (pct >= 90) return 'var(--priority-1)'
  if (pct >= 80) return 'var(--priority-2)'
  return 'var(--progress-teal)'
}

function metricColor(pct: number) {
  if (pct >= 90) return 'var(--priority-1)'
  if (pct >= 75) return 'var(--priority-2)'
  return 'var(--text-primary)'
}

function fmt(v: number, decimals = 1) {
  return v.toFixed(decimals)
}

function timeAgo(ms: number) {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return `${sec}с назад`
  if (sec < 3600) return `${Math.floor(sec / 60)}м назад`
  return `${Math.floor(sec / 3600)}ч назад`
}

export function ServerWidget() {
  const [data, setData] = useState<ServerData | null>(null)
  const [alerts, setAlerts] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(true)

  const pollMinutes = parseInt(process.env.NEXT_PUBLIC_SERVER_POLL_MINUTES || '5', 10)

  const load = useCallback(async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        fetch('/api/server'),
        fetch('/api/server/alerts'),
      ])
      if (sRes.ok) setData(await sRes.json())
      if (aRes.ok) setAlerts(await aRes.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, pollMinutes * 60 * 1000)
    return () => clearInterval(id)
  }, [load, pollMinutes])

  const items = data?.items ?? []

  const getMetric = (metric: string, scope = '') =>
    items.find(i => i.metric === metric && i.scope === scope)

  const cpu = getMetric('cpu_percent')
  const ram = getMetric('ram_percent')
  const ramUsed = getMetric('ram_used_gib')
  const ramTotal = getMetric('ram_total_gib')
  const swap = getMetric('swap_percent')
  const load1 = getMetric('load1')
  const netIn = getMetric('net_in_mbps')
  const netOut = getMetric('net_out_mbps')

  const diskMounts = [...new Set(items.filter(i => i.metric === 'disk_used_percent').map(i => i.scope))]

  // Stale check: if last update older than 3× poll interval
  const updatedAt = items[0]?.updated_at ?? 0
  const stale = updatedAt > 0 && Date.now() - updatedAt > pollMinutes * 3 * 60 * 1000
  const hasData = items.length > 0

  const isEmpty = !loading && !hasData

  return (
    <div style={{ background: 'var(--bg-card)', backgroundImage: 'var(--tint-server)', border: '1px solid var(--border-server)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>Сервер</span>
        {alerts && alerts.total > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: alerts.critical > 0 ? 'var(--priority-1)' : 'var(--priority-2)',
            background: 'var(--bg-tile)',
            border: `1px solid ${alerts.critical > 0 ? 'var(--priority-1)' : 'var(--priority-2)'}`,
            borderRadius: 999, padding: '2px 8px', letterSpacing: '0.05em',
          }}>
            {alerts.total} alert{alerts.total > 1 ? 's' : ''}
          </span>
        )}
        {stale && (
          <span style={{ fontSize: 10, color: 'var(--priority-2)', marginLeft: 'auto' }}>⚠ устарело</span>
        )}
      </div>

      {isEmpty ? (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
          Нет данных — Netdata недоступен
        </div>
      ) : loading && !hasData ? (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>…</div>
      ) : (
        <>
          {/* Disk bars */}
          {diskMounts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {diskMounts.map(mount => {
                const pct = getMetric('disk_used_percent', mount)?.value ?? 0
                const used = getMetric('disk_used_gib', mount)?.value
                const total = getMetric('disk_total_gib', mount)?.value
                return (
                  <div key={mount}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{mount}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {used !== undefined && total !== undefined
                          ? `${fmt(used)} / ${fmt(total)} GiB`
                          : `${fmt(pct)}%`}
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-tile)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, width: `${Math.min(pct, 100)}%`, background: diskColor(pct), transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* CPU / RAM / Swap / Load */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'CPU', value: cpu ? `${fmt(cpu.value)}%` : '—', color: cpu ? metricColor(cpu.value) : 'var(--text-muted)' },
              { label: 'RAM', value: ram ? `${fmt(ram.value)}%` : '—', color: ram ? metricColor(ram.value) : 'var(--text-muted)', sub: ramUsed && ramTotal ? `${fmt(ramUsed.value)}/${fmt(ramTotal.value)}G` : undefined },
              { label: 'Swap', value: swap ? `${fmt(swap.value)}%` : '—', color: swap ? metricColor(swap.value) : 'var(--text-muted)' },
              { label: 'Load', value: load1 ? fmt(load1.value) : '—', color: 'var(--text-primary)' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-label)' }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color, marginTop: 2, lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* Network */}
          {(netIn || netOut) && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                ↓ {netIn ? `${fmt(netIn.value, 2)} Mbps` : '—'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                ↑ {netOut ? `${fmt(netOut.value, 2)} Mbps` : '—'}
              </span>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {updatedAt > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: stale ? 'var(--priority-2)' : 'var(--progress-teal)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(updatedAt)}</span>
        </div>
      )}
    </div>
  )
}
