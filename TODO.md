# TODO — Tracker

Zoznam ďalších vecí na dorobenie. Zhruba zoradené podľa priority.

## Funkcie
- [ ] **Prehadzovanie poradia taskov** (drag & drop v rámci dňa).
  - Vyžaduje nový stĺpec `position int` v tabuľke `tasks` (Supabase) + radenie podľa neho.
- [ ] **Poznámka k úlohe** — pole `note` v DB už existuje, len doplniť do UI (úprava úlohy).
- [ ] **Presun úlohy na iný deň** (zmena dátumu pri úprave).
- [ ] **Opakujúce sa úlohy** (denne / týždenne).
- [ ] **Vyhľadávanie úloh.**

## Polish
- [ ] **Potvrdenie pred zmazaním kategórie** (teraz maže okamžite).
- [ ] **Prázdne stavy** — jemné hlášky, keď nie sú žiadne úlohy / kategórie / dáta v štatistikách.
- [ ] **Nastavenia / účet** — jedna obrazovka (odhlásenie, jazyk, správa kategórií).
- [ ] Manuálny prepínač svetlý / tmavý režim (teraz podľa systému).

## Pred ostrým nasadením
- [ ] **PWA ikony** — `pwa-192.png`, `pwa-512.png` chýbajú → inštalovateľná appka.
- [ ] **Supabase URL Configuration** — Site URL + Redirect URLs (aj produkčná doména) pre reset hesla a OAuth.
- [ ] Google OAuth — zapnúť provider v Supabase + nastaviť credentials (ak chceme Google login naživo).
- [ ] Zvážiť vypnutie „Confirm email" alebo nastaviť vlastné SMTP.

## Hotovo
- [x] Viacjazyčnosť (i18n) — `vue-i18n`, prepínač EN/SK, predvolene Angličtina, lokalizované dátumy, voľba uložená v localStorage.
- [x] Apple-clean redesign (Domov, Kalendár, Štatistiky, TabBar).
- [x] Kalendár — mesiac + rok + day-detail sheet.
- [x] Štatistiky — metriky, streaky, graf podľa obdobia (deň/týždeň/mesiac), rozpad podľa kategórie vrátane „Bez kategórie".
- [x] Kategórie — CRUD + farby, filter, tvorba priamo pri pridávaní úlohy, horizontálny scroll.
- [x] Úprava úlohy (premenovať / kategória / zmazať).
- [x] Auth — email/heslo, registrácia, reset hesla, Google tlačidlo.
- [x] Širší layout na webe.
