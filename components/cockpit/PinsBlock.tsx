'use client'
import { useEffect, useState } from 'react'
import type { Link } from '@/types'

function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return '' }
}

function PinTile({ link }: { link: Link }) {
  const [imgErr, setImgErr] = useState(false)
  const faviconUrl = getFavicon(link.url)
  const label = link.icon || link.name.slice(0, 2).toUpperCase()
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" title={`${link.name}\n${link.url}`} className="flex flex-col items-center gap-1.5 group">
      <div
        style={{ width: 56, height: 56, borderRadius: 'var(--radius-tile)', background: 'var(--bg-tile)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s, border-color 0.15s' }}
        className="group-hover:scale-105"
      >
        {faviconUrl && !imgErr
          ? <img src={faviconUrl} width={28} height={28} alt={link.name} onError={() => setImgErr(true)} style={{ borderRadius: 4 }} />
          : <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        }
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 60 }} className="truncate text-center block">{link.name}</span>
    </a>
  )
}

export function PinsBlock() {
  const [pins, setPins] = useState<Link[]>([])
  useEffect(() => { fetch('/api/links?pinned=1').then(r => r.json()).then(setPins).catch(() => {}) }, [])
  if (pins.length === 0) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 'var(--space-card)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-label)', textTransform: 'uppercase', marginBottom: 14 }}>Pinned</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {pins.map(link => <PinTile key={link.id} link={link} />)}
      </div>
    </div>
  )
}
