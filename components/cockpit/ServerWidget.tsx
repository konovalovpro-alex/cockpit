'use client'

export function ServerWidget() {
  return (
    <div style={{ background: 'var(--bg-card)', backgroundImage: 'var(--tint-server)', border: '1px solid var(--border-server)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>Сервер</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-tile)', border: '1px solid var(--border-default)', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.05em' }}>MVP · PLACEHOLDER</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        {['CPU', 'RAM', 'DISK'].map(label => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-label)' }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 4 }}>—</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-strong)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>nginx · docker · notion-api</span>
      </div>
    </div>
  )
}
