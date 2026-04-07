'use client'

import { BarChart2 } from 'lucide-react'

export function ProjectsWidget() {
  return (
    <div className="rounded-lg border border-dashed border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 size={14} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground">Активные проекты</h3>
        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">MVP · заглушка</span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'site-analyzer', progress: 70, color: '#6366f1' },
          { name: 'assistant', progress: 45, color: '#22c55e' },
          { name: 'advisor-app', progress: 30, color: '#f59e0b' },
        ].map((p) => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
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
