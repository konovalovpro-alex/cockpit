'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Link, Tag } from '@/types'

export function LinkForm({ initial, onSave, onClose }: {
  initial?: Partial<Link>
  onSave: (data: Omit<Partial<Link>, 'tags'> & { tags: string[] }) => Promise<void>
  onClose: () => void
}) {
  const [url, setUrl] = useState(initial?.url || '')
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [icon, setIcon] = useState(initial?.icon || '')
  const [color, setColor] = useState(initial?.color || '#6366f1')
  const [isPinned, setIsPinned] = useState(!!initial?.is_pinned)
  const [tagInput, setTagInput] = useState((initial?.tags as Tag[] | undefined)?.map((t) => t.name).join(', ') || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)
    await onSave({ url, name, description, icon, color, is_pinned: isPinned ? 1 : 0, tags })
    setSaving(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    background: 'var(--bg-tile)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <form
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 20, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{initial?.id ? 'Редактировать ссылку' : 'Добавить ссылку'}</h2>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL *" style={inputStyle} />
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Название *" style={inputStyle} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" style={inputStyle} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Иконка (буквы)" style={{ ...inputStyle, flex: 1 }} />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 40, height: 36, border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-tile)' }} />
          </div>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Теги (через запятую)" style={inputStyle} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            Закрепить в пинах
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 14px', fontSize: 13, background: 'var(--bg-tile)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer' }}>Отмена</button>
          <button type="submit" disabled={saving} style={{ padding: '7px 14px', fontSize: 13, background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'var(--accent-on)', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}
