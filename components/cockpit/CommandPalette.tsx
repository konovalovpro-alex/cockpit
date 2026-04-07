'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Command } from 'cmdk'
import Fuse from 'fuse.js'
import { Search, Link as LinkIcon, Layers, FolderOpen } from 'lucide-react'
import type { Link, Space } from '@/types'
import { parseCommand } from '@/lib/commands'
import { useSpaceContext } from './SpaceContext'

interface CommandPaletteProps {
  onNoteCreate?: (text: string) => Promise<void>
  onTaskCreate?: (text: string) => Promise<void>
}

export function CommandPalette({ onNoteCreate, onTaskCreate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [links, setLinks] = useState<Link[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [message, setMessage] = useState('')
  const { setActiveSpace } = useSpaceContext()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/links').then((r) => r.json()).then(setLinks).catch(() => {})
    fetch('/api/spaces').then((r) => r.json()).then(setSpaces).catch(() => {})
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setOpen((o) => !o)
        setValue('')
        setMessage('')
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const linksFuse = new Fuse(links, { keys: ['name', 'description', 'url'], threshold: 0.4 })
  const spacesFuse = new Fuse(spaces, { keys: ['name', 'description'], threshold: 0.4 })

  const filteredLinks = value ? linksFuse.search(value).map((r) => r.item) : links.slice(0, 6)
  const filteredSpaces = value ? spacesFuse.search(value).map((r) => r.item) : spaces.slice(0, 4)

  const handleSelect = useCallback(async (val: string) => {
    if (val.startsWith('link:')) {
      const link = links.find((l) => String(l.id) === val.replace('link:', ''))
      if (link) window.open(link.url, '_blank')
      setOpen(false)
      return
    }
    if (val.startsWith('space:')) {
      const space = spaces.find((s) => String(s.id) === val.replace('space:', ''))
      if (space) setActiveSpace(space)
      setOpen(false)
      return
    }
  }, [links, spaces, setActiveSpace])

  const handleEnter = useCallback(async () => {
    const cmd = parseCommand(value)
    if (!cmd) return

    setMessage('')

    if (cmd.type === 'note') {
      if (!cmd.arg) { setMessage('Введите текст заметки'); return }
      if (onNoteCreate) {
        await onNoteCreate(cmd.arg)
        setMessage('Заметка сохранена в Notion')
      } else {
        const r = await fetch('/api/notion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: cmd.arg }) })
        setMessage(r.ok ? 'Заметка сохранена в Notion' : 'Ошибка')
      }
      setTimeout(() => { setOpen(false); setValue(''); setMessage('') }, 1000)
      return
    }

    if (cmd.type === 'task') {
      if (!cmd.arg) { setMessage('Введите текст задачи'); return }
      if (onTaskCreate) {
        await onTaskCreate(cmd.arg)
        setMessage('Задача добавлена в Todoist')
      } else {
        const r = await fetch('/api/todoist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: cmd.arg }) })
        setMessage(r.ok ? 'Задача добавлена в Todoist' : 'Ошибка')
      }
      setTimeout(() => { setOpen(false); setValue(''); setMessage('') }, 1000)
      return
    }

    if (cmd.type === 'open') {
      const space = spaces.find((s) => s.name.toLowerCase().includes(cmd.arg.toLowerCase()))
      if (space) { setActiveSpace(space); setOpen(false); setValue('') }
      else setMessage('Пространство не найдено')
      return
    }

    if (cmd.type === 'theme') {
      document.documentElement.classList.toggle('dark')
      setOpen(false); setValue('')
      return
    }

    if (cmd.type === 'goto') {
      const link = links.find((l) => l.name.toLowerCase().includes(cmd.arg.toLowerCase()) || l.url.toLowerCase().includes(cmd.arg.toLowerCase()))
      if (link) { window.open(link.url, '_blank'); setOpen(false); setValue('') }
      else setMessage('Ссылка не найдена')
      return
    }

    if (cmd.type === 'add') {
      setOpen(false); setValue('')
      // Открыть форму добавления через событие
      window.dispatchEvent(new CustomEvent('cockpit:add-link', { detail: { url: cmd.arg } }))
      return
    }
  }, [value, links, spaces, onNoteCreate, onTaskCreate, setActiveSpace])

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setValue('') }}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search size={14} />
        <span>Поиск и команды...</span>
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <Command className="rounded-xl border border-border bg-background shadow-xl overflow-hidden">
          <div className="flex items-center border-b border-border px-3">
            <Search size={14} className="text-muted-foreground mr-2" />
            <Command.Input
              ref={inputRef}
              autoFocus
              value={value}
              onValueChange={setValue}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEnter() }}
              placeholder="Поиск или команда (note, task, open, add...)"
              className="flex-1 py-3 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-1">
            {message && (
              <div className="px-3 py-2 text-sm text-green-600 dark:text-green-400">{message}</div>
            )}
            {filteredLinks.length > 0 && (
              <Command.Group heading="Ссылки">
                {filteredLinks.map((link) => (
                  <Command.Item
                    key={link.id}
                    value={`link:${link.id}`}
                    onSelect={handleSelect}
                    className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    <LinkIcon size={13} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 truncate">{link.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-32">{new URL(link.url).hostname}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {filteredSpaces.length > 0 && (
              <Command.Group heading="Пространства">
                {filteredSpaces.map((space) => (
                  <Command.Item
                    key={space.id}
                    value={`space:${space.id}`}
                    onSelect={handleSelect}
                    className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    <Layers size={13} className="text-muted-foreground flex-shrink-0" />
                    <span>{space.icon} {space.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            <Command.Group heading="Команды">
              {['note <текст> — заметка в Notion', 'task <текст> — задача в Todoist', 'open <имя> — переключить пространство', 'add <url> — добавить ссылку', 'goto <имя> — перейти по ссылке', 'theme — переключить тему'].map((hint) => (
                <Command.Item key={hint} value={hint} className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-accent aria-selected:bg-accent cursor-default">
                  <FolderOpen size={12} />
                  {hint}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
