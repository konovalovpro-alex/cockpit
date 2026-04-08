'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { Space } from '@/types'
import { useSpaceContext } from './SpaceContext'

export function SpacesBlock() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const { activeSpace, setActiveSpace } = useSpaceContext()

  useEffect(() => {
    fetch('/api/spaces').then((r) => r.json()).then(setSpaces).catch(() => {})
  }, [])

  const openAll = (space: Space) => {
    for (const link of space.links || []) window.open(link.url, '_blank')
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase', marginBottom: 12 }}>Пространства</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-gap)' }}>
        {spaces.map((space) => (
          <div
            key={space.id}
            style={{
              background: 'var(--bg-tile)',
              border: `1px solid ${activeSpace?.id === space.id ? 'var(--accent)' : 'var(--border-default)'}`,
              borderRadius: 12,
              padding: 14,
              cursor: 'pointer',
              transition: 'transform 0.15s, border-color 0.15s',
              position: 'relative',
            }}
            className={activeSpace?.id === space.id ? '' : 'hover:-translate-y-px'}
            onClick={() => setActiveSpace(activeSpace?.id === space.id ? null : space)}
          >
            {/* Open all button */}
            <button
              onClick={(e) => { e.stopPropagation(); openAll(space) }}
              style={{ position: 'absolute', top: 10, left: 10, padding: 4, borderRadius: 4, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center' }}
              className="group-hover:opacity-100"
              title="Открыть всё в вкладках"
            >
              <ExternalLink size={11} />
            </button>
            {/* emoji top-right */}
            <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 22 }}>{space.icon || '📁'}</span>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', paddingRight: 32 }}>{space.name}</div>
            {space.description && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{space.description}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-label)', marginTop: 6 }}>{space.links?.length ?? 0} ссылок</div>
          </div>
        ))}
        {spaces.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', gridColumn: '1 / -1' }}>Нет пространств</div>
        )}
      </div>
    </div>
  )
}

export function ContextBar() {
  const { activeSpace, setActiveSpace } = useSpaceContext()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSpace) setActiveSpace(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeSpace, setActiveSpace])

  if (!activeSpace) return null

  const openAll = () => {
    for (const link of activeSpace.links || []) window.open(link.url, '_blank')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 28px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', fontSize: 13 }} className="shrink-0">
      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{activeSpace.icon} {activeSpace.name}</span>
      <span style={{ color: 'var(--text-muted)' }}>{activeSpace.links?.length ?? 0} ссылок</span>
      <button onClick={openAll} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <ExternalLink size={12} /> Открыть всё в вкладках
      </button>
      <button onClick={() => setActiveSpace(null)} style={{ marginLeft: 'auto', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <X size={14} />
      </button>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Esc · выйти</span>
    </div>
  )
}
