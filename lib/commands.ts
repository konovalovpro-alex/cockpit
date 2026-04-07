// Двуязычный детерминированный парсер команд

export type CommandType = 'add' | 'note' | 'task' | 'open' | 'theme' | 'goto'

export interface ParsedCommand {
  type: CommandType
  arg: string
}

const ALIASES: Record<string, CommandType> = {
  // English
  add: 'add',
  note: 'note',
  task: 'task',
  open: 'open',
  theme: 'theme',
  goto: 'goto',
  '+': 'add',
  // Russian
  добавить: 'add',
  заметка: 'note',
  заметку: 'note',
  задача: 'task',
  задачу: 'task',
  открыть: 'open',
  тема: 'theme',
  перейти: 'goto',
}

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const spaceIdx = trimmed.indexOf(' ')
  const word = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase()
  const arg = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim()

  const type = ALIASES[word]
  if (!type) return null

  return { type, arg }
}
