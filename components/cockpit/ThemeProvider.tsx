'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
interface ThemeContextValue { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }
const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => {}, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    // Read from html attribute set by FOUC script
    const current = document.documentElement.getAttribute('data-theme') as Theme | null
    if (current === 'light' || current === 'dark') setThemeState(current)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('cockpit-theme', t)
  }

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
