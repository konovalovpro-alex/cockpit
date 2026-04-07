'use client'

import { Server } from 'lucide-react'

export function ServerWidget() {
  return (
    <div className="rounded-lg border border-dashed border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Сервер</h3>
        </div>
        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">MVP · заглушка</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'CPU', value: '—' },
          { label: 'RAM', value: '—' },
          { label: 'Nginx', value: '—' },
          { label: 'Services', value: '—' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{item.label}</span>
            <span className="font-mono">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
