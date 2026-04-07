'use client'

import { useEffect, useState } from 'react'
import { FileText, ExternalLink, RefreshCw } from 'lucide-react'
import type { NotionTask } from '@/types'

export function NotionWidget() {
  const [tasks, setTasks] = useState<NotionTask[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    const r = await fetch('/api/notion')
    const data = await r.json()
    setTasks(data.tasks || [])
    setUpdatedAt(data.updated_at)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-foreground" />
          <h3 className="text-sm font-semibold">Notion · в работе</h3>
          <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={fetchTasks} className="p-1 rounded hover:bg-accent text-muted-foreground" disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {/* max-height 320px */}
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '320px' }}>
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/70 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate">{task.title}</div>
            </div>
            {task.url && (
              <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        ))}
        {tasks.length === 0 && !loading && (
          <div className="text-xs text-muted-foreground text-center py-3">Нет задач в работе</div>
        )}
      </div>
      {updatedAt && (
        <div className="text-xs text-muted-foreground mt-2">
          Обновлено: {new Date(updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}
