---
task: T-023
tier: M
titolo: Selettore periodo senza scroll-to-top
aree: [dashboard, navigazione, ux, next]
stato: chiuso
riporti: 0
sessioni: [2026-07-27c]
---

## Obiettivo
Cambiare il **Periodo** non deve riportare la vista in cima. Il param `?d=` e i
Server Component per il dato restano.

## Accertato
- Il selettore usa già `<Link href="/dashboard?d=...">` (page.tsx) e
  `<Link href="/dashboard/qr/{short_code}?d=...">` (singolo QR): è **già**
  navigazione soft (RSC), non un full-reload del documento.
- Causa reale dello "scroll in cima": doc ufficiale Next 16
  `node_modules/next/dist/docs/.../components/link.md:230-234` — lo `scroll` di
  `<Link>` default `true` mantiene la posizione **solo se la Page è visibile in
  viewport**; il selettore è a metà pagina, quindi dopo la navigazione la Page
  non è più in viewport → Next scrolla al primo elemento (in cima).

## Decisioni
- **`scroll={false}` sui Link del periodo** (entrambe le pagine): fix idiomatico,
  documentato, zero JS aggiunto, nessuna libreria (reg. 10). Scartato: passare a
  `router.replace(url,{scroll:false})` in un client component (stesso effetto, ma
  introduce JS e un boundary client inutili).
- La percezione di "full-reload" segnalata era lo scroll-jump + il re-render: con
  `scroll={false}` sparisce il salto.

## Attriti
- Come T-021, la dashboard è dietro auth: il comportamento non è eyeball-abile
  senza sessione. Qui però la prova è **documentale** (spec di `<Link>`), più forte
  di un eyeball. `[~]` fino alla conferma di Nick sul :3000.

## Propagazione
`grep scroll=` sulle due pagine dashboard: entrambi i selettori coperti. Nessun
altro selettore `?d=` nel repo.

## Chiusura
**Chiuso `[A]` il 2026-07-27c**: eyeball di Nick conferma che cambiando Periodo la
vista non salta più in cima → REGISTRO.
