# Stride — Weekly Task Management PWA

Apple-clean, mobile-first weekly task management app. Vue 3 + Supabase, installable as a PWA.

**Live:** https://stride-by-keno.vercel.app

<p align="center">
  <img src="docs/screenshot-home.png" width="260" alt="Home">
  <img src="docs/screenshot-stats.png" width="260" alt="Stats">
  <img src="docs/screenshot-calendar.png" width="260" alt="Calendar">
</p>

## Features

- **Home** — weekly overview (Mon–Sun), add/check off tasks, progress bar, mini chart, collapsing header.
- **Tasks** — edit (title, note, category), **drag & drop reorder**, **move to another day**, delete confirmation.
- **Calendar** — month + year view (infinite scroll), color-coded day status, day detail sheet.
- **Statistics** — Week/Month/Year, metrics + streaks, bar chart, category breakdown, **GitHub-style activity heatmap**.
- **Categories** — CRUD + colors, filter, create directly when adding a task.
- **Account** — email/password + Google, password reset, **7 languages** (EN/SK/DE/ES/FR/IT/PT, auto from browser), **system/light/dark** theme.

## Stack

Vue 3 · Vite · TypeScript · Pinia · Vue Router · Bootstrap (utilities) · vue-i18n · vuedraggable · Chart.js · `vite-plugin-pwa` · **Supabase** (Postgres + Auth + RLS, the entire backend).

## Supabase Setup

1. Create a project at https://supabase.com
2. Copy the URL and ANON_KEY from Project Settings → API
3. Add to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## DB Setup

Run in Supabase SQL Editor:

```sql
create table categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name        text not null,
  color       text not null default '#8E8E93',
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title        text not null,
  task_date    date not null,
  task_time    time,
  duration_min int,
  priority     boolean not null default false,
  repeat       text not null default 'none' check (repeat in ('none','daily','weekly','monthly')),
  status       text not null default 'todo' check (status in ('todo','done')),
  category_id  uuid references categories (id) on delete set null,
  note         text,
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index tasks_user_date_idx on tasks (user_id, task_date);

alter table tasks      enable row level security;
alter table categories enable row level security;

create policy "tasks owner only" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories owner only" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Migration — drag & drop order

If your `tasks` table is missing the `position` column:

```sql
alter table tasks add column if not exists position int not null default 0;

with ordered as (
  select id, row_number() over (partition by user_id, task_date order by created_at) - 1 as rn
  from tasks
)
update tasks t set position = o.rn from ordered o where o.id = t.id;
```

### Migration — time, duration, priority, repeat

```sql
alter table tasks add column if not exists task_time time;
alter table tasks add column if not exists duration_min int;
alter table tasks add column if not exists priority boolean not null default false;
alter table tasks add column if not exists repeat text not null default 'none'
  check (repeat in ('none','daily','weekly','monthly'));
```

### Migration — category order

```sql
alter table categories add column if not exists position int not null default 0;

with ordered as (
  select id, row_number() over (partition by user_id order by created_at) - 1 as rn
  from categories
)
update categories c set position = o.rn from ordered o where o.id = c.id;
```

### Account deletion (Edge Function)

Deleting an auth user can't be done from the browser — it runs via the `supabase/functions/delete-account` Edge Function (service-role). Deleting the user **cascades** to their `tasks` and `categories`.

Deploy (Supabase CLI, logged in and linked):

```bash
supabase functions deploy delete-account
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically. The client calls it via `supabase.functions.invoke('delete-account')`.

## Local Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`.

### Demo mode

In dev the app shows generated data **without login** (`src/lib/demo.ts`). To use real Supabase data in dev, set `VITE_DEMO=false` in `.env.local`. Production builds always use real data.

## Build

```bash
npm run build   # vue-tsc + vite build
```

## Project Structure

- `src/views/` — `HomeView`, `CalendarView`, `StatsView`, `AccountView`, `AuthView`
- `src/components/` — `AppHeader`, `TabBar`, `DayList`, `CategoryPicker`, `CategoriesSheet`, `LanguageSwitch`
- `src/stores/` — Pinia: `tasks`, `categories`, `auth`
- `src/lib/` — `supabase`, `dates`, `status`, `colors`, `theme`, `demo`
- `src/i18n/` — `messages` (EN/SK/DE/ES/FR/IT/PT), `dates` (localized formats)
- `src/styles/app.css` — design tokens + light/dark

## Auth

Email/password + **Google OAuth** via Supabase Auth. Enable Google in Authentication → Providers → Google. After deploying, add the production domain to Authentication → URL Configuration (Site URL + Redirect URLs).

## PWA

Installable, service worker caches the app shell. Icon: `public/stride_icon.svg`; PWA PNG icons: `pwa-192.png` / `pwa-512.png`.

---

Backlog and ideas: see **`TODO.md`**.
