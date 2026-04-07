'use client'

import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Link, Tag } from '@/types'
import { useSpaceContext } from './SpaceContext'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form
        className="bg-background border border-border rounded-xl p-5 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">{initial?.id ? 'Редактировать ссылку' : 'Добавить ссылку'}</h2>
          <button type="button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL *" className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring" />
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Название *" className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring" />
          <div className="flex gap-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Иконка (буквы)" className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring" />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 border border-input rounded-md cursor-pointer" />
          </div>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Теги (через запятую)" className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-1 ring-ring" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
            Закрепить в пинах
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-accent">Отмена</button>
          <button type="submit" disabled={saving} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
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
    <div className="flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Все ссылки</h2>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{displayedLinks.length}</span>
        </div>
        <button
          onClick={() => { setEditLink(undefined); setShowForm(true) }}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Добавить ссылку"
        >
          <Plus size={14} />
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2 py-0.5 rounded-full text-xs transition-colors ${!activeTag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            Все
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
              className={`px-2 py-0.5 rounded-full text-xs transition-colors ${activeTag === tag.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1 overflow-y-auto max-h-80">
        {displayedLinks.map((link) => (
          <div key={link.id} className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: link.color || '#6366f1' }}
            >
              {link.icon || link.name.slice(0, 1).toUpperCase()}
            </div>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0">
              <div className="text-sm truncate">{link.name}</div>
              {link.description && <div className="text-xs text-muted-foreground truncate">{link.description}</div>}
            </a>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-muted text-muted-foreground">
                <ExternalLink size={12} />
              </a>
              <button onClick={() => { setEditLink(link); setShowForm(true) }} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <Pencil size={12} />
              </button>
              <button onClick={() => handleDelete(link.id)} className="p-1 rounded hover:bg-muted text-red-500">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {displayedLinks.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-6">
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
