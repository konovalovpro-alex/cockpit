import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'cockpit.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  fs.mkdirSync(DATA_DIR, { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  migrate(_db)
  return _db
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      is_pinned INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS link_tags (
      link_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (link_id, tag_id),
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS space_links (
      space_id INTEGER NOT NULL,
      link_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      PRIMARY KEY (space_id, link_id),
      FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      color TEXT,
      notion_url TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cache_todoist_today (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cache_todoist_p1 (
      id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cache_todoist_inbox (
      id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cache_todoist_week (
      id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cache_todoist_all (
      id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cache_notion_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cache_weather (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Initialize preset cache rows
  for (const table of ['cache_todoist_p1', 'cache_todoist_inbox', 'cache_todoist_week', 'cache_todoist_all']) {
    db.prepare(`INSERT OR IGNORE INTO ${table} (id, data, updated_at) VALUES (1, '[]', datetime('now'))`).run()
  }
}
