---
task: T-005
tier: M
titolo: Generatore QR (creazione, personalizzazione colori/logo, download PNG/SVG)
aree: [qr, short_code, generazione, owner_id, rls, server-action, dashboard]
stato: chiuso
riporti: 0
sessioni: [2026-07-24]
---

## Obiettivo

Un utente crea un QR dinamico (nome + URL destinazione), lo personalizza
(colori, logo) e ne scarica PNG/SVG. Il QR codifica l'indirizzo immutabile
`/r/{short_code}`, non il target diretto.

## Accertato

- Schema `qr_codes` (`supabase/migrations/20260724000001_...sql:14-21`): `short_code`
  è `not null unique` **senza default** → lo genera l'app; il trigger
  `qr_codes_lock_short_code` (righe 27-42) ne blocca solo l'update.
- RLS insert `with check (auth.uid() = owner_id)` (riga 73): l'insert con owner
  altrui fallisce lato DB anche se l'app sbagliasse.
- Next 16 Server Actions: `'use server'`, POST, auth da verificare dentro l'azione
  (`node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`).
- `@base-ui` Button usa il prop `render`, **non** `asChild` (verificato in
  `components/ui/button.tsx:43-56`).
- Prove: `lib/short-code.test.ts` 5/5; `lib/qr-create.test.ts` 1/1 (insert
  owner-scoped, spoof owner_id bloccato, isolamento tra utenti); flusso UI
  end-to-end (signup→crea→dettaglio, canvas 320×320 40.599px scuri via JS) e
  `/r/vleDKAWd`→302 `https://example.com/promo` con scansione contata in dashboard
  (QR creati 1, Scansioni 1). Revisore approvato (`memoria/review/2026-07-24-T005.json`).

## Domande e risposte

- Chi genera `short_code`? → **l'app** (funzione pura + retry su unique). Cons.:
  logica testabile, nessuna migrazione; il vincolo `unique` DB resta la garanzia.
- Ampiezza primo taglio? → **completo con personalizzazione** (canvas colori/logo
  in dynamic import). Cons.: più file ora, ma feature intera.

## Decisioni

- Il QR si progetta **dopo** la creazione, sulla pagina di dettaglio, perché
  codifica `/r/{short_code}` che nasce all'insert: preview = risultato (regola 7).
  Scartato progettare in `/new` sul `target_url`: preview ≠ QR salvato.
- Generazione base62 con **rejection sampling** (scarta byte ≥ 248 = 4×62) per
  evitare il bias del modulo. Scartato il modulo secco (leggero sbilanciamento).
- Designer (canvas + `qrcode`) in `dynamic import` `ssr:false`: foglia pesante
  fuori dal bundle server (regola 9). Il logo è disegnato sul canvas (PNG); nell'SVG
  non è incorporato — limite dichiarato nella UI e nel codice.

## Attriti

- `<Button asChild>` non funziona → causa: `@base-ui` (non Radix) usa `render` →
  sostituito con `render={<Link/>}` → prevenibile? **lezione** (nota in STATO/PATTERN:
  il Button di questo progetto vuole `render`, non `asChild`).
- Nessun altro attrito: schema, auth e RLS erano già accertati da T-002/T-004.

## Composizione

**Consuma** di T-004: `serverSupabase()` (client autenticato owner-scoped) per
l'insert e le letture. **Stabilisce** per T-006 (analytics): la pagina di
dettaglio `/dashboard/qr/[short_code]` è il punto naturale dove innestare la
timeline delle scansioni di quel QR; `redirectUrl()` in `lib/qr.ts` e il
generatore in `lib/short-code.ts` sono riusabili. `NEXT_PUBLIC_SITE_URL` va
impostata in produzione (oggi fallback `localhost:3000`) — nota di deploy.
