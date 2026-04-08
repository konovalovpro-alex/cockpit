'use client'

import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'

export function FABButtons() {
  const [noteOpen, setNoteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [taskText, setTaskText] = useState('')
  const [message, setMessage] = useState('')

  const saveNote = async () => {
    if (!noteText.trim()) return
    const r = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: noteText }),
    })
    setMessage(r.ok ? 'Заметка сохранена' : 'Ошибка')
    setNoteText('')
    setTimeout(() => { setNoteOpen(false); setMessage('') }, 1200)
  }

  const saveTask = async () => {
    if (!taskText.trim()) return
    const r = await fetch('/api/todoist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: taskText }),
    })
    setMessage(r.ok ? 'Задача добавлена' : 'Ошибка')
    setTaskText('')
    setTimeout(() => { setTaskOpen(false); setMessage('') }, 1200)
  }

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.5)',
  }

  const modalCardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-card)',
    padding: 20,
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    background: 'var(--bg-tile)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <>
      {/* FAB buttons */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 40 }}>
        {/* Note FAB */}
        <button
          onClick={() => { setNoteOpen(true); setTaskOpen(false) }}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px var(--accent-glow)', transition: 'transform 0.15s, box-shadow 0.15s', color: 'var(--accent-on)' }}
          className="hover:-translate-y-0.5"
          title="Быстрая заметка"
        >
          <Pencil size={18} strokeWidth={1.5} />
        </button>
        {/* Task FAB */}
        <button
          onClick={() => { setTaskOpen(true); setNoteOpen(false) }}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s', color: 'var(--text-secondary)' }}
          className="hover:-translate-y-0.5"
          title="Быстрая задача"
        >
          <Check size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Note modal */}
      {noteOpen && (
        <div style={modalStyle} onClick={() => setNoteOpen(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Быстрая заметка → Notion</h3>
              <button onClick={() => setNoteOpen(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
            </div>
            {message ? (
              <div style={{ fontSize: 13, color: 'var(--progress-teal)', padding: '12px 0', textAlign: 'center' }}>{message}</div>
            ) : (
              <>
                <textarea
                  autoFocus
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote() }}
                  placeholder="Текст заметки..."
                  style={{ ...inputStyle, height: 96, resize: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⌘Enter для сохранения</span>
                  <button onClick={saveNote} style={{ padding: '7px 14px', fontSize: 13, background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'var(--accent-on)', cursor: 'pointer' }}>Сохранить</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Task modal */}
      {taskOpen && (
        <div style={modalStyle} onClick={() => setTaskOpen(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Быстрая задача → Todoist</h3>
              <button onClick={() => setTaskOpen(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
            </div>
            {message ? (
              <div style={{ fontSize: 13, color: 'var(--progress-teal)', padding: '12px 0', textAlign: 'center' }}>{message}</div>
            ) : (
              <>
                <input
                  autoFocus
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveTask() }}
                  placeholder="Текст задачи... (Enter для сохранения)"
                  style={inputStyle}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={saveTask} style={{ padding: '7px 14px', fontSize: 13, background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'var(--accent-on)', cursor: 'pointer' }}>Добавить</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
