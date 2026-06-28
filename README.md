# Stride — Weekly Task Management PWA

Apple-clean, mobile-first týždenná appka na úlohy. Vue 3 + Supabase, inštalovateľná ako PWA.

**Live:** https://stride-by-keno.vercel.app

<p align="center">
  <img src="docs/screenshot-home.png" width="260" alt="Domov">
  <img src="docs/screenshot-stats.png" width="260" alt="Štatistiky">
  <img src="docs/screenshot-calendar.png" width="260" alt="Kalendár">
</p>

## Funkcie

- **Domov** — týždenný prehľad (Po–Ne), pridávanie/odškrtávanie úloh, progres, mini graf, swipe medzi týždňami, zbaľovacia hlavička.
- **Úlohy** — úprava (názov, poznámka, kategória), **drag & drop poradie**, **presun na iný deň**, potvrdenie pred zmazaním.
- **Kalendár** — mesiac + rok (nekonečný scroll), stav dní farebne, detail dňa.
- **Štatistiky** — Týždeň/Mesiac/Rok, metriky + streaky, graf, rozpad podľa kategórie, **GitHub-style heatmapa** aktivity.
- **Kategórie** — CRUD + farby, filter, tvorba priamo pri pridávaní úlohy.
- **Účet** — email/heslo + Google, reset hesla, **7 jazykov** (EN/SK/DE/ES/FR/IT/PT, auto podľa prehliadača), téma **systém/svetlá/tmavá**.

## Stack

Vue 3 · Vite · TypeScript · Pinia · Vue Router · Bootstrap (utilities) · vue-i18n · vuedraggable · Chart.js · `vite-plugin-pwa` · **Supabase** (Postgres + Auth + RLS, jediný backend).

## Setup Supabase

1. Vytvor projekt na https://supabase.com
2. Skopíruj URL a ANON_KEY z Project Settings → API
3. Vlož do `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## DB Setup

Spusti SQL v Supabase SQL Editor:

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

### Migrácia pre existujúcu DB (drag & drop poradie)

Ak už máš `tasks` bez stĺpca `position`, spusti:

```sql
alter table tasks add column if not exists position int not null default 0;

-- backfill poradia podľa created_at v rámci dňa
with ordered as (
  select id, row_number() over (partition by user_id, task_date order by created_at) - 1 as rn
  from tasks
)
update tasks t set position = o.rn from ordered o where o.id = t.id;
```

### Migrácia pre existujúcu DB (voliteľný čas + odhad trvania)

```sql
alter table tasks add column if not exists task_time time;
alter table tasks add column if not exists duration_min int;
alter table tasks add column if not exists priority boolean not null default false;
alter table tasks add column if not exists repeat text not null default 'none'
  check (repeat in ('none','daily','weekly','monthly'));
```

### Migrácia pre existujúcu DB (poradie kategórií)

```sql
alter table categories add column if not exists position int not null default 0;

-- backfill podľa created_at
with ordered as (
  select id, row_number() over (partition by user_id order by created_at) - 1 as rn
  from categories
)
update categories c set position = o.rn from ordered o where o.id = c.id;
```

### Zmazanie účtu (Edge Function)

Mazanie auth používateľa sa nedá z prehliadača — beží cez Edge Function
`supabase/functions/delete-account` (service-role). Zmazanie usera **cascade**
odstráni jeho `tasks` aj `categories` (obe majú `on delete cascade` na `auth.users`).

Nasadenie (Supabase CLI, prihlásený + prepojený projekt):

```bash
supabase functions deploy delete-account
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` a `SUPABASE_SERVICE_ROLE_KEY` sa do funkcie
injektujú automaticky — netreba ich nastavovať. Klient ju volá cez
`supabase.functions.invoke('delete-account')` (JWT sa pošle automaticky).

## Inštalácia a spustenie

```bash
npm install
npm run dev
```

Dev server beží na `http://localhost:5173`.

### Demo režim

V deve appka ukazuje vygenerované dáta **bez prihlásenia** (`src/lib/demo.ts`). Pre reálne Supabase dáta v deve daj `VITE_DEMO=false` do `.env.local`. Produkčný build vždy používa reálne dáta.

## Build

```bash
npm run build   # vue-tsc + vite build
```

## Štruktúra

- `src/views/` — `HomeView`, `CalendarView`, `StatsView`, `AccountView`, `AuthView`
- `src/components/` — `AppHeader`, `TabBar`, `DayList`, `CategoryPicker`, `CategoriesSheet`, `LanguageSwitch`
- `src/stores/` — Pinia: `tasks`, `categories`, `auth`
- `src/lib/` — `supabase`, `dates`, `status`, `colors`, `theme`, `demo`
- `src/i18n/` — `messages` (EN/SK), `dates` (lokalizované formáty)
- `src/styles/app.css` — dizajn tokeny + light/dark

## Autentifikácia

Email/heslo + **Google OAuth** cez Supabase Auth. Google: zapni v Authentication → Providers → Google. Po nasadení pridaj produkčnú doménu do Authentication → URL Configuration (Site URL + Redirect URLs) kvôli OAuth a resetu hesla.

## PWA

Inštalovateľná, service worker cachuje app shell. Ikona je `public/stride_icon.svg`; pre niektoré platformy sa hodí doplniť aj `pwa-192.png` / `pwa-512.png`.

---

Ďalšie nápady a backlog: pozri **`TODO.md`**.
