# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/)

## [Unreleased]

### Added (CRUD · раунд 4)
- PUT /api/links/[id] — редактирование ссылки с пересчётом тегов (транзакция)
- DELETE /api/links/[id] — удаление с возвратом объекта для undo
- POST /api/links/restore — восстановление удалённой ссылки с тем же id
- LinksBlock: hover-иконки Pencil/Trash2 на каждой строке
- LinksBlock: удаление с undo-toast (5 сек, sonner) и оптимистичным обновлением
- PinsBlock: режим редактирования (Pencil в шапке), wiggle-анимация плиток
- PinsBlock: крестик-кнопка «открепить» с анимацией scale(0)
- LinkForm вынесен в отдельный файл components/cockpit/LinkForm.tsx

### Changed (UI раунд 3 — полировка и интерактив)
- **Fullscreen layout**: `html, body` — `height: 100vh; overflow: hidden`, все скроллбары скрыты глобально (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`)
- **page.tsx**: TopBar и ContextBar — `flexShrink: 0`; main-область — `flex: 1; minHeight: 0`. Левая колонка: PinsBlock shrink-0, LinksBlock `flex: 1` (растягивается), SpacesBlock shrink-0. Правая колонка: TodoistWidget и NotionWidget — `flex: 1`, ProjectsWidget и ServerWidget — `flexShrink: 0`
- **LinksBlock, TodoistWidget, NotionWidget**: убран фиксированный `maxHeight`, добавлен `height: 100%; display: flex; flexDirection: column` на карточке; список — `flex: 1; minHeight: 0; overflowY: auto`
- **Dark theme bg**: `--bg-page: #0B0A12`, `--bg-card: #11101A`, `--bg-card-hover / --bg-tile: #16151F`
- **Тинты карточек**: добавлены CSS-переменные `--tint-*` (градиент 4% opacity) и `--border-*` (цветные бордеры) для всех 7 карточек. Light-тема — 0.025 opacity
- **LinksBlock активный тег**: при `activeTag === tag.id` фон и бордер теперь `var(--accent)` (индиго) вместо цвета тега
- **ContextBar**: название пространства — `fontSize: 16px; fontWeight: 500`; кнопка «Открыть всё в вкладках» — `border: 1px solid var(--accent)`, прозрачный фон, на hover заполняется акцентом (CSS-класс `.open-all-btn:hover`)
- **POST /api/todoist/close**: закрывает задачу в Todoist REST v2, убирает из SQLite-кэша
- **POST /api/notion/complete-task**: патчит статус страницы Notion на «Готово» через PATCH /v1/pages/{id}
- **TodoistWidget**: клик на outlined-кружок приоритета — оптимистичное удаление с анимацией fade-out + translateX(-8px) 200ms, toast при ошибке (sonner)
- **NotionWidget**: клик на Square-иконку — Square → CheckSquare, то же fade-out + toast при ошибке
- **Todoist пресеты**: 5 фильтров (Сегодня / P1 / Inbox / Неделя / Все), 4 новые SQLite-таблицы (`cache_todoist_p1/inbox/week/all`), cron синхронизирует все пресеты, новый роут `GET /api/todoist/tasks?preset=X`, пресет сохраняется в `localStorage`
- **sonner**: установлен пакет, `<Toaster richColors position="bottom-right" />` добавлен в `app/layout.tsx`

### Changed (UI раунд 2 — Stitch redesign)
- Inter font (400/500/600) via `next/font/google` с поддержкой кириллицы
- Полный переезд `theme.css`: dark (#0A0A0B) + light (#F2F2F7), токены `--bg-*`, `--text-*`, `--accent`, `--priority-*`, `--progress-*`
- Система тем переключена на `data-theme` атрибут (вместо `.dark` класса), добавлен FOUC-скрипт в `<head>`
- `ThemeProvider`: toggle light/dark, читает атрибут из HTML (set by FOUC script)
- `TopBar`: приветствие с учётом времени суток (утро/день/вечер/ночь), время 20px, кнопка темы 32×32px круглая
- `PinsBlock`: плитки 56×56px, Google Favicon API (28px), 6-колоночная сетка
- `LinksBlock`: фавиконки 20×20px, домен под названием, tag badge справа, все цвета через CSS-переменные
- `SpacesBlock`: 2-колоночная сетка, emoji в правом верхнем углу, hover translateY(-1px)
- `TodoistWidget`: приоритет — outlined круг (border, не fill), метка priority+project под задачей
- `NotionWidget`: Square иконка из lucide, max-height 320px
- `ProjectsWidget`: прогресс-бары 3px, бейдж MVP·PLACEHOLDER, переменные `--progress-*`
- `ServerWidget`: 3-колоночная сетка CPU/RAM/DISK, сервисная строка внизу
- `FABButtons`: accent-кнопка заметки + gray-кнопка задачи, glow-тень, Check вместо CheckSquare
- `page.tsx`: inline styles вместо Tailwind для layout wrapper

### Changed
- [UI раунд 1] Визуальные токены вынесены в `app/theme.css` (CSS-переменные)
- [UI раунд 1 · п.1] Padding 32px + max-width 1600px на основной контейнер
- [UI раунд 1 · п.2] Gap 16px между левой и правой колонками
- [UI раунд 1 · п.3] Блок пинов оформлен как карточка с заголовком «★ Закреплено»
- [UI раунд 1 · п.4] Иконки пинов 34×34px, палитра из тёмных muted-тонов (800-й уровень)
- [UI раунд 1 · п.5] Прогресс-бары проектов: высота 3px, цвета из var(--bar-*) mid-tones
- [UI раунд 1 · п.6] Пространства перенесены под ссылки в левую колонку, однострочный список
- [UI раунд 1 · п.7] Todoist фильтр: `today | overdue` вместо только `today`
- [UI раунд 1 · п.8] Todoist и Notion виджеты: max-height 320px + overflow-y auto
- [UI раунд 1 · п.9] Переключатель темы подтверждён и виден в TopBar справа
- [UI раунд 1 · п.10] Дата 16px font-medium, время muted монохромное, температура выровнена
- [UI раунд 1 · п.11] Виджет сервера: пунктирная рамка → сплошная, бейдж сохранён

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
