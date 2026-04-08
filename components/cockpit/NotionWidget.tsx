'use client'

import { useEffect, useState } from 'react'
import { Square, ExternalLink, RefreshCw } from 'lucide-react'
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
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
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

      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border-default)' }}>
            <Square size={13} strokeWidth={1.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
            </div>
            {task.url && (
              <a href={task.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        ))}
        {tasks.length === 0 && !loading && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Нет задач в работе</div>
        )}
      </div>

      {updatedAt && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Обновлено: {new Date(updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}
