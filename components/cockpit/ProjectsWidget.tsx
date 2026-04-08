'use client'

const PROJECTS = [
  { name: 'site-analyzer', progress: 70, color: 'var(--progress-purple)' },
  { name: 'assistant',     progress: 45, color: 'var(--progress-teal)' },
  { name: 'advisor-app',   progress: 30, color: 'var(--progress-coral)' },
]

export function ProjectsWidget() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>Активные проекты</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-tile)', border: '1px solid var(--border-default)', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.05em' }}>MVP · PLACEHOLDER</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PROJECTS.map((p) => (
          <div key={p.name}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', tabularNums: true } as React.CSSProperties}>{p.progress}%</span>
            </div>
            {/* 3px thin bar */}
            <div style={{ height: 3, borderRadius: 999, background: 'var(--bg-tile)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${p.progress}%`, background: p.color, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
