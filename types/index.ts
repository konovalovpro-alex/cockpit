export interface Link {
  id: number
  url: string
  name: string
  description?: string
  icon?: string
  color?: string
  is_pinned: number
  sort_order: number
  created_at: string
  tags?: Tag[]
}

export interface Tag {
  id: number
  name: string
  color?: string
}

export interface Space {
  id: number
  name: string
  description?: string
  icon?: string
  sort_order: number
  links?: Link[]
}

export interface Project {
  id: number
  name: string
  progress: number
  color?: string
  notion_url?: string
  is_active: number
  sort_order: number
}

export interface TodoistTask {
  id: string
  content: string
  priority: number
  project_id?: string
  project_name?: string
  labels?: string[]
  due?: { date: string; datetime?: string }
  is_completed: boolean
}

export interface NotionTask {
  id: string
  title: string
  status: string
  url?: string
}

export interface WeatherData {
  temperature: number
  weathercode: number
  windspeed: number
}
