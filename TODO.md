# TODO — Tracker

Zoznam ďalších vecí na dorobenie. Zhruba zoradené podľa priority.

## Funkcie
- [ ] **Poznámka k úlohe** — pole `note` v DB už existuje, len doplniť do UI (úprava úlohy).
- [ ] **Opakujúce sa úlohy** (denne / týždenne).
- [ ] **Vyhľadávanie úloh.**

## Pred ostrým nasadením
- [ ] **PWA ikony (PNG)** — appka je už inštalovateľná cez `stride_icon.svg`, ale doplniť aj `pwa-192.png` / `pwa-512.png` (+ maskable) pre platformy, čo nemajú radi SVG.
- [ ] **Supabase URL Configuration** — Site URL + Redirect URLs (aj produkčná doména) pre reset hesla a OAuth.
- [ ] Google OAuth — zapnúť provider v Supabase + nastaviť credentials (ak chceme Google login naživo).
- [ ] Zvážiť vypnutie „Confirm email" alebo nastaviť vlastné SMTP.

## Hotovo
- [x] Potvrdenie pred zmazaním (kategórie aj úlohy) + add form sa po pridaní zatvorí.
- [x] Prázdne stavy — filter kategórie bez úloh (Domov), žiadne dáta v grafe (Štatistiky), prázdne kategórie.
- [x] Kalendár — „Dnes" v ročnom zobrazení skočí na aktuálny mesiac.
- [x] Prehadzovanie poradia taskov (drag & drop v rámci dňa, `position` stĺpec) + presun úlohy na iný deň (dátum v úprave).
- [x] Účet / Nastavenia stránka — email, jazyk, téma (Systém/Svetlý/Tmavý), správa kategórií, zmena hesla, odhlásenie; ikona nastavení v hlavičke.
- [x] Manuálny prepínač svetlý / tmavý režim (`data-theme` + localStorage, default systém).
- [x] Viacjazyčnosť (i18n) — `vue-i18n`, prepínač EN/SK, predvolene Angličtina, lokalizované dátumy, voľba uložená v localStorage.
- [x] Apple-clean redesign (Domov, Kalendár, Štatistiky, TabBar).
- [x] Kalendár — mesiac + rok + day-detail sheet.
- [x] Štatistiky — metriky, streaky, graf podľa obdobia (deň/týždeň/mesiac), rozpad podľa kategórie vrátane „Bez kategórie".
- [x] Kategórie — CRUD + farby, filter, tvorba priamo pri pridávaní úlohy, horizontálny scroll.
- [x] Úprava úlohy (premenovať / kategória / zmazať).
- [x] Auth — email/heslo, registrácia, reset hesla, Google tlačidlo.
- [x] Širší layout na webe.
