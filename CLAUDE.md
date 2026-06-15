# CLAUDE.md — Tracker

Weekly task-management PWA. Apple-clean, mobile-first, cloud-synced. Personal app (single user uses it, but multi-user via auth).

## Stack

- Vue 3 + Vite + TypeScript
- Pinia (state) + Vue Router
- **Bootstrap** for styling (NOT Tailwind). Avoid default Bootstrap component look — lean on utilities + small custom CSS to keep the Apple-clean aesthetic.
- `vite-plugin-pwa` (installable, offline app shell)
- Supabase (Postgres + Auth + auto REST API) — this is the entire backend, no custom server
- Chart.js via `vue-chartjs` (Stats screen only)

## Architecture

- The Pinia `tasks` store is the **only layer that talks to the DB** (via `supabase-js`). Components never call Supabase directly.
- Auth: Supabase Auth, **Google OAuth** (+ magic link optional) → issues JWT/session.
- **RLS** enforces isolation at the DB level: `auth.uid() = user_id`. Every request carries the JWT; only the user's own rows come back.
- `user_id` is **never sent from the client** — it defaults to `auth.uid()` on insert, and `with check` blocks spoofing.
- Data flow: `Vue PWA → Supabase Auth (JWT) → supabase.from('tasks') + JWT → PostgREST → RLS → Postgres → data back`.
- Offline: service worker caches the app shell so the app opens offline. Full offline-first writes (IndexedDB + sync) are explicitly deferred to a later version — do not add now.

## Data model (already created in Supabase, see README.md for SQL)

- `tasks`: `id, user_id, title, task_date (date), status ('todo'|'done'), category_id (nullable FK), note, created_at, completed_at`
- `categories`: `id, user_id, name, color, created_at`
- Notes:
  - Column is `task_date`, NOT `date` (reserved word).
  - `category_id` is nullable — v1 works without categories. Categories + their colors get turned on later; the model is already ready (no migration needed).
  - `completed_at` is set **app-side** on toggle (store sets `new Date().toISOString()` when status → done, `null` when → todo). No DB trigger.
  - Weeks are NOT stored. Group by ISO week over `task_date`; charts aggregate over the same column. Index `(user_id, task_date)` covers week/month range queries.

## Conventions

- UI labels in **Slovak** (Domov / Kalendár / Štatistiky, day names Pondelok…Nedeľa, months Január…December).
- Week starts **Monday** (po ut st št pi so ne).
- Prefer targeted, incremental edits over rewrites.
- Keep code/answers concise.
- Date strings are `'YYYY-MM-DD'` throughout.

## Design system (Apple-clean)

- System font stack (`-apple-system, SF Pro, Inter, system-ui`). Lots of whitespace, subtle grays, hairline `0.5px` borders, generous corner radii.
- Bottom tab bar with 3 tabs: Domov (home icon), Kalendár (calendar), Štatistiky (chart-bar). Active tab = blue (`--color-text-info`).
- Icons: Tabler outline webfont (`<i class="ti ti-...">`).
- Two font weights only: 400 and 500. Sentence case. No emoji.
- Color tokens + dark mode are defined in `design/app.css`. Reuse those values when building the real Bootstrap views (or map them to CSS vars / SCSS).

### Color logic (THE important rule — same across all screens)

| State | Meaning | Visual |
|---|---|---|
| green (`success`) | day fully done / completed task | green dot / green checkbox / strikethrough item |
| red (`danger`) | **two uses:** (a) past day that had tasks but wasn't finished = "missed"; (b) the "today" marker | red dot (missed) vs red filled circle / red number (today) — different channels so they don't clash |
| gray (`tertiary`) | planned (today/future, not yet judged) | gray dot |
| none | day had no tasks | no dot |

To avoid the today/missed red clash: **today** = red filled circle around the number; **status** = a small dot *under* the number.

## Design reference pages

`design/*.html` are faithful static reproductions of the approved mockups — open them in a browser and match layout, spacing, colors, components when building the views. They share `design/app.css`.

- `design/home.html` → `HomeView.vue`
- `design/calendar-month.html` → month view
- `design/calendar-year.html` → year view
- `design/stats.html` → `StatsView.vue`

## Screen specs

### Domov (HomeView) — main / default landing

- Top: reserved slot for app name/logo (placeholder for now).
- Title "Tento týždeň" + date range. Right: `‹ ›` (prev/next week) + `+` (quick add). Swipe left/right also switches weeks.
- Week summary: "X / Y" done + thin progress bar.
- Mini 7-day bar chart (Po→Ne): bar height = total tasks that day, green portion = done. Today's letter is red. Empty days show only a baseline dot.
- Agenda list Po→Ne (each day = header with name + date + "done/total", then task rows).
  - Task row: circle checkbox (green filled + check when done, empty outline when todo). Done items: gray + strikethrough.
  - **"Pridať položku" row shows ONLY on today + future days.** Past days have no add affordance.
  - Future days with no tasks collapse to a compact single line: "Deň 13. jún … + Pridať".
  - Today's section is subtly tinted + its name/date is red.
- **Collapsing sticky header** (build as a layer on top once the rest works, scroll-driven, no data changes): at top of scroll the full header (title + summary + chart) is shown; on scroll it collapses to a thin sticky strip = "Tento týždeň · X/Y" + thin progress + `‹ ›`.

### Kalendár — 3 zoom levels, vertical infinite scroll (Apple model)

- **Year**: 12 mini-month grids (3 columns), vertical infinite scroll across years. Each day with activity gets a small **colored** dot by status (green done / red missed / gray planned). Today = red filled circle. Current month name = red. Tap a month → zoom to month view.
- **Month**: full grid, weekday header `po ut st št pi so ne` (Monday-start). Each day = number + status dot + small task count. Today = red filled circle. Vertical infinite scroll between months. Tap a day → day detail.
- **Day detail**: bottom sheet that **reuses the `DayList` day component from Domov** (same checkboxes + "Pridať"). No new design.

### Štatistiky (StatsView)

- Period segmented control: Týždeň / Mesiac / Rok.
- Metric cards (2×2): "Hotové · <obdobie>", "Completion %", "Aktuálny streak" (flame icon), "Najdlhší streak".
- Bar chart "Hotové po týždňoch" (last ~6 weeks; current/partial week label highlighted red). Build with Chart.js / vue-chartjs.
- Small insight line ("Najsilnejší deň v týždni: …").
- "Podľa kategórie" breakdown (horizontal bars). Currently placeholder data; activates when categories are turned on. Per-category colors are TBD — bars are neutral blue for now.

## Build order (suggested)

1. `HomeView` — wire to `tasks` store `fetchRange(monday, sunday)`, render agenda + checkboxes (`toggleTask`) + add (`addTask`).
2. Extract the day block into reusable `DayList.vue` (used by Home + Calendar day detail).
3. Calendar month view, then year view (compute first-weekday offset + length per month, Monday-start), then day-detail sheet.
4. Stats: aggregations over `task_date` + Chart.js bars.
5. Collapsing sticky header on Home (polish).
6. Categories: CRUD + colors + filters (the deferred feature).
