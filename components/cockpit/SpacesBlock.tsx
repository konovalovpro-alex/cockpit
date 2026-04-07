'use client'

import { useEffect, useState } from 'react'
import { Layers, ExternalLink, X } from 'lucide-react'
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
      <div className="flex items-center gap-2 mb-2">
        <Layers size={14} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold">Пространства</h2>
      </div>

      {/* Single-column list — full width of left column */}
      <div className="flex flex-col gap-2">
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent ${
              activeSpace?.id === space.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setActiveSpace(activeSpace?.id === space.id ? null : space)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium shrink-0">{space.icon} {space.name}</span>
                {space.description && (
                  <span className="text-xs text-muted-foreground truncate">{space.description}</span>
                )}
                <span className="text-xs text-muted-foreground shrink-0">{space.links?.length ?? 0} ссылок</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); openAll(space) }}
                className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors ml-2 shrink-0"
                title="Открыть всё в вкладках"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
        {spaces.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">Нет пространств</div>
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
    <div className="flex items-center gap-3 px-6 py-2 bg-primary/10 border-b border-primary/20 text-sm shrink-0">
      <span className="font-medium">{activeSpace.icon} {activeSpace.name}</span>
      <span className="text-muted-foreground">{activeSpace.links?.length ?? 0} ссылок</span>
      <button onClick={openAll} className="flex items-center gap-1 text-xs text-primary hover:underline">
        <ExternalLink size={12} /> Открыть всё в вкладках
      </button>
      <button onClick={() => setActiveSpace(null)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
        <X size={14} />
      </button>
      <span className="text-xs text-muted-foreground">Esc · выйти</span>
    </div>
  )
}
