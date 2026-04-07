'use client'

import { BarChart2 } from 'lucide-react'

const PROJECTS = [
  { name: 'site-analyzer', progress: 70, color: 'var(--bar-purple)' },
  { name: 'assistant',     progress: 45, color: 'var(--bar-teal)' },
  { name: 'advisor-app',   progress: 30, color: 'var(--bar-coral)' },
]

export function ProjectsWidget() {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Активные проекты</h3>
        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">MVP · заглушка</span>
      </div>
      <div className="space-y-2.5">
        {PROJECTS.map((p) => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.progress}%</span>
            </div>
            {/* height: 3px — thin bars */}
            <div className="h-[3px] rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${p.progress}%`, backgroundColor: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
