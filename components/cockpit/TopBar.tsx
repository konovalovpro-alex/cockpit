'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { CommandPalette } from './CommandPalette'

export function TopBar() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [weather, setWeather] = useState<{ temperature: number } | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json())
      .then((data) => { if (data.weather) setWeather(data.weather) })
      .catch(() => {})
  }, [])

  const cycleTheme = () => {
    const order: ('auto' | 'light' | 'dark')[] = ['auto', 'light', 'dark']
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % 3])
  }

  const themeIcon = theme === 'light' ? <Sun size={14} /> : theme === 'dark' ? <Moon size={14} /> : <Monitor size={14} />

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-background shrink-0">
      {/* Date — 16px, day heading */}
      <div className="flex-1">
        <span className="text-base text-foreground capitalize font-medium">{date}</span>
      </div>

      {/* Command palette — center */}
      <div className="flex-1 max-w-xl">
        <CommandPalette />
      </div>

      {/* Right: weather + time + theme toggle */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {weather && (
          <span className="text-sm text-muted-foreground tabular-nums">{weather.temperature}°C</span>
        )}
        <span className="text-sm text-muted-foreground font-mono tabular-nums">{time}</span>
        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={`Тема: ${theme}`}
        >
          {themeIcon}
        </button>
      </div>
    </div>
  )
}
