'use client'

import { useState } from 'react'
import { PenLine, CheckSquare, X } from 'lucide-react'

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

  return (
    <>
      {/* FAB buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => { setNoteOpen(true); setTaskOpen(false) }}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          title="Быстрая заметка"
        >
          <PenLine size={18} />
        </button>
        <button
          onClick={() => { setTaskOpen(true); setNoteOpen(false) }}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          title="Быстрая задача"
        >
          <CheckSquare size={18} />
        </button>
      </div>

      {/* Note modal */}
      {noteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setNoteOpen(false)}>
          <div className="bg-background border border-border rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Быстрая заметка → Notion</h3>
              <button onClick={() => setNoteOpen(false)}><X size={16} /></button>
            </div>
            {message ? (
              <div className="text-sm text-green-600 dark:text-green-400 py-3 text-center">{message}</div>
            ) : (
              <>
                <textarea
                  autoFocus
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote() }}
                  placeholder="Текст заметки..."
                  className="w-full h-24 px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">⌘Enter для сохранения</span>
                  <button onClick={saveNote} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Сохранить</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Task modal */}
      {taskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setTaskOpen(false)}>
          <div className="bg-background border border-border rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Быстрая задача → Todoist</h3>
              <button onClick={() => setTaskOpen(false)}><X size={16} /></button>
            </div>
            {message ? (
              <div className="text-sm text-green-600 dark:text-green-400 py-3 text-center">{message}</div>
            ) : (
              <>
                <input
                  autoFocus
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveTask() }}
                  placeholder="Текст задачи... (Enter для сохранения)"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring"
                />
                <div className="flex justify-end mt-3">
                  <button onClick={saveTask} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Добавить</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
