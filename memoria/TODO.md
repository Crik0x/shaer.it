# TODO

**Saldo: 6 aperti — 6 nuovi, 0 riportati**

Stati: `[ ]` da fare · `[~]` scritto ma non provato · `[A]` provato e accettato ·
`[x]` fatto con prova · `[>]` riportato (con `↻` e il suo dossier)

**Questo file non si riscrive mai.** È un saldo, non una fotografia: cresce per
task nuovi, cala solo per task arrivati a destinazione **con prova** — fatto
(→REGISTRO) · archiviato (→DECISIONI, col perché) · riportato (resta, `↻`+1).
Senza destinazione, una riga rientra.
A **`↻3`** ci si ferma e si porta il task a Nick con due o tre vie d'uscita.
Solo la sezione «Per Nick» si sostituisce.

## Ora

- [ ] T-001 **Scaffold dell'app** — `create-next-app` (Next.js 16, TypeScript,
      Tailwind, App Router) in `apps/web/`, poi shadcn/ui. Prova: `npm run dev`
      risponde con la home su 127.0.0.1
- [N] T-002 **Progetto Supabase dedicato** — Nick crea il progetto (nome, regione
      EU); poi migrazione iniziale `qr_codes` + `qr_scans` con `owner_id` e RLS
      (schema minimo da `MD/QR_PLATFORM.md` §18 — NON da `0001_initial_schema.sql`,
      che è dominio Shaer col modello crediti vecchio)
- [ ] T-003 **Il cuore: redirect dinamico** — route `/r/[short_code]` che risolve
      dal DB, logga la scansione (IP anonimizzato) in append e fa 302. È il pezzo
      che rende «dinamico» il QR: `short_code` immutabile (regola d'oro 7)
- [ ] T-004 **Auth + dashboard scheletro** — Supabase Auth (magic link), layout
      dashboard con Server Components, indicatori vuoti (QR creati, scansioni)
- [ ] T-005 **Generatore QR** — creazione QR con URL target, salvataggio,
      download PNG/SVG; il canvas di personalizzazione entra con `dynamic import`
- [ ] T-006 **Analytics prima lettura** — timeline scansioni per QR (derivata da
      `qr_scans`, mai contatori memorizzati), grafico Recharts in `dynamic import`

## Riportati

## Fatto

## Per Nick — comandi e azioni

*(questa sezione si **sostituisce** a ogni avanzamento, non si accumula)*

1. **Crea il progetto Supabase** per la QR Platform (dashboard Supabase → New
   project, regione EU — serve per T-002; il progetto damascati NON si riusa).
   Quando c'è, incolla in sessione URL e anon key (mai la service key in chat).
2. **Prompt prossima sessione** (copia-incolla, da dentro `D:\Desktop\Shaer.it`):
   > /apertura. Coda: **T-001** (scaffold Next.js 16 + Tailwind + shadcn in
   > `apps/web/`), poi **T-003** se c'è tempo (route `/r/[short_code]` con mock
   > locale finché il DB non c'è). T-002 aspetta il progetto Supabase. Chiudi
   > con /chiusura.
