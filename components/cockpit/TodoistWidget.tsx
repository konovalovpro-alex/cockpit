'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, RefreshCw } from 'lucide-react'
import type { TodoistTask } from '@/types'

const PRIORITY_COLORS: Record<number, string> = {
  4: 'bg-red-500',
  3: 'bg-orange-400',
  2: 'bg-blue-400',
  1: 'bg-muted-foreground/40',
}

export function TodoistWidget() {
  const [tasks, setTasks] = useState<TodoistTask[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    const r = await fetch('/api/todoist')
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
          <CheckSquare size={14} className="text-red-500" />
          <h3 className="text-sm font-semibold">Todoist · сегодня</h3>
          <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={fetchTasks} className="p-1 rounded hover:bg-accent text-muted-foreground" disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {/* max-height 320px */}
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '320px' }}>
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS[1]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs leading-tight">{task.content}</div>
              {task.project_name && (
                <div className="text-xs text-muted-foreground">{task.project_name}</div>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && !loading && (
          <div className="text-xs text-muted-foreground text-center py-3">Задач на сегодня нет</div>
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
