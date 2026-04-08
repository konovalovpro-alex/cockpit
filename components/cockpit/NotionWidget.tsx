'use client'

import { useEffect, useState } from 'react'
import { Square, CheckSquare, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { NotionTask } from '@/types'

export function NotionWidget() {
  const [tasks, setTasks] = useState<NotionTask[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [closingTasks, setClosingTasks] = useState<Set<string>>(new Set())
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set())

  const fetchTasks = async () => {
    setLoading(true)
    const r = await fetch('/api/notion')
    const data = await r.json()
    setTasks(data.tasks || [])
    setUpdatedAt(data.updated_at)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  const handleComplete = async (taskId: string) => {
    // Show checked icon briefly then fade out
    setCheckedTasks(prev => new Set(prev).add(taskId))
    setClosingTasks(prev => new Set(prev).add(taskId))

    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setClosingTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
      setCheckedTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 200)

    // API call
    try {
      const res = await fetch('/api/notion/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: taskId }),
      })
      if (!res.ok) {
        const r = await fetch('/api/notion')
        const data = await r.json()
        setTasks(data.tasks || [])
        toast.error('Не удалось завершить задачу')
      }
    } catch {
      const r = await fetch('/api/notion')
      const data = await r.json()
      setTasks(data.tasks || [])
      toast.error('Ошибка при завершении задачи')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', backgroundImage: 'var(--tint-notion)', border: '1px solid var(--border-notion)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>Notion · в работе</span>
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
          const isChecked = checkedTasks.has(task.id)
          return (
            <div
              key={task.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border-default)',
                opacity: isClosing ? 0 : 1,
                transform: isClosing ? 'translateX(-8px)' : 'none',
                transition: 'all 200ms ease-out',
              }}
            >
              <div
                onClick={() => handleComplete(task.id)}
                style={{ flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.15s', color: 'var(--text-muted)' }}
                className="hover:scale-110"
                title="Завершить задачу"
              >
                {isChecked
                  ? <CheckSquare size={13} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  : <Square size={13} strokeWidth={1.5} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
              </div>
              {task.url && (
                <a href={task.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          )
        })}
        {tasks.length === 0 && !loading && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Нет задач в работе</div>
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
