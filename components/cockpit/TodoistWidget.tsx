'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { TodoistTask } from '@/types'

function priorityColor(p: number) {
  if (p === 4) return 'var(--priority-1)'
  if (p === 3) return 'var(--priority-2)'
  return 'var(--priority-3)'
}

function priorityLabel(p: number) {
  if (p === 4) return 'PRIORITY 1'
  if (p === 3) return 'PRIORITY 2'
  if (p === 2) return 'PRIORITY 3'
  return 'PRIORITY 4'
}

export function TodoistWidget() {
  const [tasks, setTasks] = useState<TodoistTask[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [closingTasks, setClosingTasks] = useState<Set<string>>(new Set())

  const fetchTasks = async () => {
    setLoading(true)
    const r = await fetch('/api/todoist')
    const data = await r.json()
    setTasks(data.tasks || [])
    setUpdatedAt(data.updated_at)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  const handleClose = async (taskId: string) => {
    // Start fade-out animation
    setClosingTasks(prev => new Set(prev).add(taskId))

    // After animation, remove from list
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setClosingTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 200)

    // API call
    try {
      const res = await fetch('/api/todoist/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      })
      if (!res.ok) {
        // Revert
        const r = await fetch('/api/todoist')
        const data = await r.json()
        setTasks(data.tasks || [])
        toast.error('Не удалось закрыть задачу')
      }
    } catch {
      const r = await fetch('/api/todoist')
      const data = await r.json()
      setTasks(data.tasks || [])
      toast.error('Ошибка при закрытии задачи')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', backgroundImage: 'var(--tint-todoist)', border: '1px solid var(--border-todoist)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>Todoist · сегодня</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tile)', padding: '1px 7px', borderRadius: 999 }}>{tasks.length}</span>
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          style={{ padding: 4, borderRadius: 6, background: 'var(--bg-tile)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tasks.map((task) => {
          const isClosing = closingTasks.has(task.id)
          return (
            <div
              key={task.id}
              style={{
                display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-default)',
                opacity: isClosing ? 0 : 1,
                transform: isClosing ? 'translateX(-8px)' : 'none',
                transition: 'all 200ms ease-out',
              }}
            >
              {/* priority circle - outlined, clickable */}
              <div
                onClick={() => handleClose(task.id)}
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `2px solid ${priorityColor(task.priority)}`,
                  flexShrink: 0, marginTop: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                className="hover:scale-110"
                title="Завершить задачу"
              />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.content}</div>
                {task.project_name && (
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: priorityColor(task.priority), marginTop: 2 }}>
                    {priorityLabel(task.priority)} · {task.project_name}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {tasks.length === 0 && !loading && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Задач на сегодня нет</div>
        )}
      </div>

      {updatedAt && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, flexShrink: 0 }}>
          Обновлено: {new Date(updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}
