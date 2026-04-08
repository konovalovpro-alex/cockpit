'use client'

import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Link, Tag } from '@/types'
import { useSpaceContext } from './SpaceContext'

function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return '' }
}

function getHostname(url: string) {
  try { return new URL(url).hostname } catch { return url }
}

function LinkForm({ initial, onSave, onClose }: {
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

export function LinksBlock() {
  const [links, setLinks] = useState<Link[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTag, setActiveTag] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editLink, setEditLink] = useState<Link | undefined>()
  const { activeSpace } = useSpaceContext()

  const fetchLinks = useCallback(async () => {
    const url = activeTag ? `/api/links?tag=${activeTag}` : '/api/links'
    const r = await fetch(url)
    const data = await r.json()
    setLinks(data)
  }, [activeTag])

  useEffect(() => { fetchLinks() }, [fetchLinks])
  useEffect(() => {
    fetch('/api/tags').then((r) => r.json()).then(setTags).catch(() => {})
  }, [])

  // Listen for add-link event from command palette
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setEditLink({ url: detail?.url || '', name: '', is_pinned: 0, sort_order: 0, id: 0, created_at: '' })
      setShowForm(true)
    }
    window.addEventListener('cockpit:add-link', handler)
    return () => window.removeEventListener('cockpit:add-link', handler)
  }, [])

  const displayedLinks = activeSpace
    ? links.filter((l) => activeSpace.links?.some((sl) => sl.id === l.id))
    : links

  const handleSave = async (data: Omit<Partial<Link>, 'tags'> & { tags: string[] }) => {
    if (editLink?.id) {
      await fetch(`/api/links/${editLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setShowForm(false)
    setEditLink(undefined)
    fetchLinks()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить ссылку?')) return
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
    fetchLinks()
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>Все ссылки</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tile)', padding: '1px 7px', borderRadius: 999 }}>{displayedLinks.length}</span>
        </div>
        <button
          onClick={() => { setEditLink(undefined); setShowForm(true) }}
          style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-tile)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title="Добавить ссылку"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, cursor: 'pointer', background: !activeTag ? 'var(--accent)' : 'transparent', border: `1px solid ${!activeTag ? 'var(--accent)' : 'var(--border-default)'}`, color: !activeTag ? 'var(--accent-on)' : 'var(--text-muted)', transition: 'all 0.15s' }}
          >
            Все
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
              style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, cursor: 'pointer', background: activeTag === tag.id ? 'var(--accent)' : 'transparent', border: `1px solid ${activeTag === tag.id ? 'var(--accent)' : 'var(--border-default)'}`, color: activeTag === tag.id ? 'var(--accent-on)' : 'var(--text-muted)', transition: 'all 0.15s' }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Links list */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }} className="scroll-fade">
        {displayedLinks.map((link) => (
          <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }} className="group">
            <img
              src={getFavicon(link.url)}
              width={20}
              height={20}
              alt=""
              style={{ borderRadius: 4, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getHostname(link.url)}</div>
            </a>
            {/* tag badge */}
            {(link.tags as Tag[] | undefined)?.[0] && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-tile)', border: '1px solid var(--border-default)', borderRadius: 999, padding: '2px 7px', flexShrink: 0 }}>
                {(link.tags as Tag[])[0].name}
              </span>
            )}
            {/* action buttons */}
            <div style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }} className="group-hover:opacity-100">
              <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ padding: 4, borderRadius: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={11} />
              </a>
              <button onClick={() => { setEditLink(link); setShowForm(true) }} style={{ padding: 4, borderRadius: 4, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Pencil size={11} />
              </button>
              <button onClick={() => handleDelete(link.id)} style={{ padding: 4, borderRadius: 4, color: 'var(--priority-1)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
        {displayedLinks.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            Нет ссылок. Добавьте первую!
          </div>
        )}
      </div>

      {showForm && (
        <LinkForm
          initial={editLink}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditLink(undefined) }}
        />
      )}
    </div>
  )
}
