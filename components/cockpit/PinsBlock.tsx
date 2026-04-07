'use client'

import { useEffect, useState } from 'react'
import type { Link } from '@/types'

// Muted dark palette, cycles through pins in order
const PIN_PALETTE = [
  { bg: '#3C3489', text: '#EEEDFE' }, // purple
  { bg: '#0C447C', text: '#E6F1FB' }, // blue
  { bg: '#085041', text: '#E1F5EE' }, // teal
  { bg: '#633806', text: '#FEF3C7' }, // amber
  { bg: '#712B13', text: '#FEE2E2' }, // coral
  { bg: '#2C2C2A', text: '#F3F4F6' }, // gray
]

function PinIcon({ link, index }: { link: Link; index: number }) {
  const palette = PIN_PALETTE[index % PIN_PALETTE.length]
  const label = link.icon || link.name.slice(0, 2).toUpperCase()

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.name}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div
        className="rounded-lg flex items-center justify-center text-xs font-bold shadow-sm transition-transform group-hover:scale-110"
        style={{
          width: 'var(--pin-size)',
          height: 'var(--pin-size)',
          backgroundColor: palette.bg,
          color: palette.text,
        }}
      >
        {label}
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[52px] text-center group-hover:text-foreground transition-colors">
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
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">★</span>
        <h2 className="text-sm font-semibold">Закреплено</h2>
      </div>
      <div className="flex gap-4 flex-wrap">
        {pins.map((link, i) => (
          <PinIcon key={link.id} link={link} index={i} />
        ))}
      </div>
    </div>
  )
}
