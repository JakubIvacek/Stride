# TODO — Stride

Nápady a vylepšenia na premyslenie. Legenda námahy: **S** = malé, **M** = stredné, **L** = veľké. 🔥 = odporúčané (dobrý pomer hodnota/námaha).

## Správa úloh
- [ ] **Vyhľadávanie úloh** (S) — hľadať podľa názvu/poznámky. 🔥
- [ ] **Priorita / vlajka** (S) — zvýrazniť dôležité úlohy.
- [ ] **Podúlohy / checklist** v úlohe (M).
- [ ] **Opakujúce sa úlohy** (M–L) — denne / týždenne; každý výskyt = samostatný task. Treba stĺpec `repeat` + generovanie výskytov + „zmazať tento / celú sériu".

## Gestá / UX
- [ ] **Swipe na úlohe** (M) — swipe = hotovo / zmazať. 🔥 (mobil)
- [ ] **Undo po zmazaní** (S–M) — snackbar „Späť" namiesto/popri confirme.
- [ ] **Animácie / haptika** (S) — jemné prechody, vibrácia pri akcii.

## Štatistiky
- [ ] **Týždenný cieľ** (S) — cieľ X úloh/týždeň + progres.
- [ ] **Trend completion % v čase** (M).

## Kategórie / organizácia
- [ ] **Preradenie poradia kategórií** (S).
- [ ] **Filter podľa viacerých kategórií naraz** (S).
- [ ] **Archív / pohľad len hotové** (S).

## Účet / dáta
- [ ] **Export / import** (S–M) — CSV/JSON záloha úloh.
- [ ] **Zmazať účet + dáta** (S).

## PWA / platforma
- [ ] **PWA PNG ikony** (S) — `pwa-192.png` / `pwa-512.png` (+ maskable); svg už funguje. 🔥
- [ ] **Pripomienky / push notifikácie** (L) — „nezabudni na úlohu" (potrebuje riešenie pre push).
- [ ] **Offline-first** (L) — IndexedDB + sync (CLAUDE.md to vedome odkladá).

## Pred ostrým nasadením
- [ ] **Hosting** (Vercel / Cloudflare Pages / Netlify) + SPA rewrite config + env premenné.
- [ ] Pri nasadení pridať produkčnú doménu do **Supabase → Auth → URL Configuration**.
- [ ] Zvážiť vypnutie „Confirm email" alebo vlastné SMTP (default email má prísne limity).

---

## Hotovo
- [x] Čas úlohy — voliteľný čas dňa (hodina:minúta select, 24h) + odhad trvania (15m–12h); riadok ukazuje „14:00 · 2h", zoradenie podľa času.
- [x] Color picker pre kategóriu — vlastná farba (natívny `color` input s kvapkadlom) popri preset palete.
- [x] Štatistiky — heatmapa aktivity (GitHub-style) + insight podľa obdobia (najsilnejší deň/týždeň/mesiac).
- [x] Poznámka k úlohe — textarea v úprave, zobrazená pod názvom.
- [x] Prehadzovanie poradia (drag & drop, `position`) + presun úlohy na iný deň.
- [x] Potvrdenie pred zmazaním (kategórie aj úlohy) + add form sa po pridaní zatvorí.
- [x] Prázdne stavy (filter bez úloh, žiadne dáta v grafe, prázdne kategórie).
- [x] Kalendár — „Dnes" v ročnom zobrazení skočí na aktuálny mesiac.
- [x] Účet / Nastavenia stránka — email, jazyk, téma (Systém/Svetlý/Tmavý), kategórie, zmena hesla, odhlásenie.
- [x] Manuálny prepínač svetlý/tmavý režim (`data-theme` + localStorage) + dark date-picker (`color-scheme`).
- [x] Viacjazyčnosť (i18n) — EN/SK, predvolene EN, lokalizované dátumy, voľba v localStorage.
- [x] Auth — email/heslo, registrácia, reset hesla, Google OAuth (funguje aj naživo).
- [x] Apple-clean redesign (Domov, Kalendár, Štatistiky, jednotná hlavička, branding Stride).
- [x] Kalendár — mesiac + rok + day-detail sheet.
- [x] Štatistiky — metriky, streaky, graf podľa obdobia, rozpad podľa kategórie (vrátane „Bez kategórie").
- [x] Kategórie — CRUD + farby, filter, tvorba pri pridávaní úlohy, horizontálny scroll.
- [x] Úprava úlohy (premenovať / kategória / poznámka / presun / zmazať).
- [x] Širší layout na webe.
