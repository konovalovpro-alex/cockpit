'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { CommandPalette } from './CommandPalette'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 17) return 'Добрый день'
  if (h >= 17 && h < 23) return 'Добрый вечер'
  return 'Доброй ночи'
}

export function TopBar() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [greeting, setGreeting] = useState('')
  const [weather, setWeather] = useState<{ temperature: number } | null>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }))
      setGreeting(getGreeting())
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/weather').then(r => r.json()).then(d => { if (d.weather) setWeather(d.weather) }).catch(() => {})
  }, [])

  return (
    <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }} className="flex items-center gap-4 px-7 py-3 shrink-0">
      {/* Left: greeting + date */}
      <div className="flex-1 min-w-0">
        <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500 }}>{greeting}, Алексей</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }} className="capitalize">{date}</div>
      </div>
      {/* Center: search */}
      <div className="flex-1 max-w-lg">
        <CommandPalette />
      </div>
      {/* Right: time + weather + theme */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="text-right">
          <div style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 500 }} className="tabular-nums leading-none">{time}</div>
          {weather && <div style={{ color: 'var(--text-muted)', fontSize: '11px' }} className="tabular-nums mt-0.5">{weather.temperature}°C · Стамбул</div>}
        </div>
        <button
          onClick={toggle}
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tile)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          {theme === 'dark' ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  )
}
