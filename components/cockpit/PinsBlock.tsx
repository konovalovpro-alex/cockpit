'use client'

import { useEffect, useState } from 'react'
import type { Link } from '@/types'

function LinkIcon({ link }: { link: Link }) {
  const initial = link.icon || link.name.slice(0, 2).toUpperCase()
  const color = link.color || '#6366f1'
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.name}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-110"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-14 text-center group-hover:text-foreground transition-colors">
        {link.name}
      </span>
    </a>
  )
}

export function PinsBlock() {
  const [pins, setPins] = useState<Link[]>([])

  useEffect(() => {
    fetch('/api/links?pinned=1')
      .then((r) => r.json())
      .then(setPins)
      .catch(() => {})
  }, [])

  if (pins.length === 0) return null

  return (
    <div className="mb-4">
      <div className="flex gap-4 flex-wrap">
        {pins.map((link) => (
          <LinkIcon key={link.id} link={link} />
        ))}
      </div>
    </div>
  )
}
