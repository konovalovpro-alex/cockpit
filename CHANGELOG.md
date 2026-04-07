# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/)

## [Unreleased]

### Added
- [Этап 1 · задача 1] Создан GitHub-репозиторий `cockpit`, README.md и CHANGELOG.md
- [Этап 1 · задача 2] Добавлен `.gitignore` с node_modules, .env*, *.db, /data, .next, dist
- [Этап 1 · задача 3] Инициализирован Next.js 15 проект с TypeScript + Tailwind + App Router
- [Этап 1 · задача 4] Установлены зависимости: shadcn/ui, cmdk, fuse.js, better-sqlite3, lucide-react, node-cron
- [Этап 1 · задача 5] Настроен shadcn/ui, ThemeProvider (light/dark/auto), localStorage
- [Этап 1 · задача 6] Создана схема SQLite: 6 основных таблиц + 3 кэш-таблицы, миграции на старте через instrumentation.ts
- [Этап 1 · задача 7] Базовый layout: TopBar + двухколоночная сетка 2fr/1fr
- [Этап 2 · задача 1] API-роуты /api/links — CRUD ссылок с тегами
- [Этап 2 · задача 2] API-роуты /api/tags — CRUD тегов, связи M:N
- [Этап 2 · задача 3] Компонент PinsBlock — пины из links WHERE is_pinned=1
- [Этап 2 · задача 4] Компонент LinksBlock — список с фильтром по тегам
- [Этап 2 · задача 5] Форма добавления/редактирования ссылки (модалка)
- [Этап 3 · задача 1] API-роуты /api/spaces — CRUD пространств
- [Этап 3 · задача 2] API для связей space-link
- [Этап 3 · задача 3] Компонент SpacesBlock — карточки пространств
- [Этап 3 · задача 4] Режим контекста через SpaceContext + фильтрация ссылок
- [Этап 3 · задача 5] ContextBar — полоска контекста, кнопка «Открыть всё», Esc
- [Этап 4 · задача 1] CommandPalette — интеграция cmdk + fuzzy-поиск через fuse.js
- [Этап 4 · задача 2] Парсер команд lib/commands.ts — двуязычный (ru/en)
- [Этап 4 · задача 3] Команды: add, note, task, open, theme, goto
- [Этап 4 · задача 4] Горячая клавиша Cmd+K / Ctrl+K
- [Этап 5 · задача 1] API-клиент Notion: чтение задач, запись заметок
- [Этап 5 · задача 2] API-клиент Todoist: чтение задач, создание задачи
- [Этап 5 · задача 3] API-клиент Open-Meteo: текущая погода
- [Этап 5 · задача 4] Cron-джобы через node-cron (5 мин / 30 мин) в instrumentation.ts
- [Этап 5 · задача 5] API-роуты /api/notion, /api/todoist, /api/weather для чтения кэша
- [Этап 6 · задача 1] Компонент TodoistWidget — задачи с цветами приоритетов
- [Этап 6 · задача 2] Компонент NotionWidget — задачи в работе
- [Этап 6 · задача 3] Компонент ProjectsWidget — заглушка с прогресс-барами
- [Этап 6 · задача 4] Компонент ServerWidget — заглушка
- [Этап 6 · задача 5] Часы и погода в TopBar
- [Этап 7 · задача 1] FABButton «Заметка» — модалка + Cmd+Enter
- [Этап 7 · задача 2] FABButton «Задача» — модалка + Enter
- [Этап 7 · задача 3] Переключатель темы light/dark/auto + localStorage
