'use client'
import { useEffect, useState, useCallback } from 'react'
import { Pencil, X } from 'lucide-react'
import type { Link, Tag } from '@/types'
import { LinkForm } from './LinkForm'

function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return '' }
}

function PinTile({ link, editMode, removing, onUnpin, onEdit }: {
  link: Link
  editMode: boolean
  removing: boolean
  onUnpin: (link: Link) => void
  onEdit: (link: Link) => void
}) {
  const [imgErr, setImgErr] = useState(false)
  const faviconUrl = getFavicon(link.url)
  const label = link.icon || link.name.slice(0, 2).toUpperCase()

  const handleClick = () => {
    if (editMode) {
      onEdit(link)
    } else {
      window.open(link.url, '_blank')
    }
  }

  return (
    <div
      title={`${link.name}\n${link.url}`}
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        opacity: removing ? 0 : 1,
        transform: removing ? 'scale(0)' : 'scale(1)',
        transition: 'all 200ms',
      }}
    >
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onUnpin(link) }}
          style={{
            position: 'absolute', top: -6, left: -6,
            width: 20, height: 20, borderRadius: '50%',
            background: '#EF4444', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', zIndex: 10,
          }}
        >
          <X size={10} />
        </button>
      )}
      <div
        className={editMode ? 'pin-tile--editing' : ''}
        style={{
          width: 56, height: 56, borderRadius: 'var(--radius-tile)',
          background: 'var(--bg-tile)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s, border-color 0.15s',
        }}
      >
        {faviconUrl && !imgErr
          ? <img src={faviconUrl} width={28} height={28} alt={link.name} onError={() => setImgErr(true)} style={{ borderRadius: 4 }} />
          : <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        }
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', display: 'block' }}>{link.name}</span>
    </div>
  )
}

export function PinsBlock() {
  const [pins, setPins] = useState<Link[]>([])
  const [editMode, setEditMode] = useState(false)
  const [editLink, setEditLink] = useState<Link | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())

  const fetchPins = useCallback(() => {
    fetch('/api/links?pinned=1').then(r => r.json()).then(setPins).catch(() => {})
  }, [])

  useEffect(() => { fetchPins() }, [fetchPins])

  useEffect(() => {
    if (!editMode) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEditMode(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editMode])

  const handleUnpin = async (link: Link) => {
    setRemovingIds(prev => new Set([...prev, link.id]))
    setTimeout(async () => {
      await fetch(`/api/links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...link, is_pinned: 0, tags: (link.tags as Tag[])?.map(t => t.name) || [] }),
      })
      fetchPins()
      setRemovingIds(prev => { const s = new Set(prev); s.delete(link.id); return s })
    }, 200)
  }

  const handleSave = async (data: Omit<Partial<Link>, 'tags'> & { tags: string[] }) => {
    if (editLink?.id) {
      await fetch(`/api/links/${editLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setShowForm(false)
    setEditLink(undefined)
    fetchPins()
  }

  if (pins.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backgroundImage: 'var(--tint-pinned)', border: '1px solid var(--border-pinned)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase' }}>★ Pinned</span>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            width: 22, height: 22, borderRadius: 5,
            background: editMode ? 'var(--accent)' : 'var(--bg-tile)',
            border: `1px solid ${editMode ? 'var(--accent)' : 'var(--border-default)'}`,
            color: editMode ? 'var(--accent-on)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          title={editMode ? 'Выйти из режима редактирования' : 'Редактировать пины'}
        >
          <Pencil size={11} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {pins.map(link => (
          <PinTile
            key={link.id}
            link={link}
            editMode={editMode}
            removing={removingIds.has(link.id)}
            onUnpin={handleUnpin}
            onEdit={(l) => { setEditLink(l); setShowForm(true) }}
          />
        ))}
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
