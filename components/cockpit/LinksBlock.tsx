'use client'

import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Link, Tag } from '@/types'
import { useSpaceContext } from './SpaceContext'
import { LinkForm } from './LinkForm'

function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return '' }
}

function getHostname(url: string) {
  try { return new URL(url).hostname } catch { return url }
}

export function LinksBlock() {
  const [links, setLinks] = useState<Link[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTag, setActiveTag] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editLink, setEditLink] = useState<Link | undefined>()
  const [hoveredId, setHoveredId] = useState<number | null>(null)
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

  const handleDelete = async (link: Link) => {
    // Optimistically remove from list
    setLinks(prev => prev.filter(l => l.id !== link.id))

    const res = await fetch(`/api/links/${link.id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      // Restore on error
      setLinks(prev => [...prev, link])
      toast.error('Не удалось удалить ссылку')
      return
    }

    toast(`Ссылка «${link.name}» удалена`, {
      duration: 5000,
      action: {
        label: 'Отменить',
        onClick: async () => {
          const r = await fetch('/api/links/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.deletedLink),
          })
          if (r.ok) {
            fetchLinks()
            toast.success('Ссылка восстановлена')
          } else {
            toast.error('Не удалось восстановить')
          }
        },
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', backgroundImage: 'var(--tint-links)', border: '1px solid var(--border-links)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)', boxSizing: 'border-box' }}>
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
          {tags.map((tag) => {
            const isActive = activeTag === tag.id
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTag(isActive ? null : tag.id)}
                style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, cursor: 'pointer',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent)' : tag.color || 'var(--border-default)'}`,
                  color: isActive ? '#fff' : tag.color || 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Links list */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} className="scroll-fade">
        {displayedLinks.map((link) => (
          <div
            key={link.id}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-default)', cursor: 'pointer', position: 'relative' }}
            onMouseEnter={() => setHoveredId(link.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
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
            {/* tag badges — hidden on hover */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, opacity: hoveredId === link.id ? 0 : 1, transition: 'opacity 150ms' }}>
              {(link.tags as Tag[] | undefined)?.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    fontSize: 10,
                    borderRadius: 999,
                    padding: '2px 7px',
                    flexShrink: 0,
                    color: tag.color || 'var(--text-muted)',
                    background: tag.color ? `${tag.color}18` : 'var(--bg-tile)',
                    border: `1px solid ${tag.color ? `${tag.color}40` : 'var(--border-default)'}`,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            {/* hover action icons */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, position: 'absolute', right: 0 }}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: 4, borderRadius: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', opacity: hoveredId === link.id ? 1 : 0, transition: 'opacity 150ms' }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={11} />
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); setEditLink(link); setShowForm(true) }}
                style={{ padding: 4, borderRadius: 4, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: hoveredId === link.id ? 1 : 0, transition: 'opacity 150ms' }}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(link) }}
                style={{ padding: 4, borderRadius: 4, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: hoveredId === link.id ? 1 : 0, transition: 'opacity 150ms' }}
              >
                <Trash2 size={14} />
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
