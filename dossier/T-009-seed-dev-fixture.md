---
task: T-009
tier: M
titolo: Eseguire e provare la fixture dev (supabase/seed.sql)
aree: [seed, fixture, supabase, sviluppo]
stato: aperto
riporti: 0
sessioni: [2026-07-25]
---

# T-009 · Seed dev — eseguire e provare

## Obiettivo
`supabase/seed.sql` gira una volta contro il progetto dev e la fixture esiste
davvero (utente-dev con 3 QR e una timeline popolata). Oggi è `[~]`: scritto,
approvato dal revisore (g1: manca solo la prova d'esecuzione), non ancora
eseguito.

## Accertato
- Il file è scorporato da T-007 (respinto per la password in chiaro, poi
  ridisegnato). Non crea più l'utente in `auth.users`: lo **cerca per email**.
- `apps/qr/lib/*` non dipende dalla fixture: la sua assenza non rompe nulla.

## Decisioni
- **L'utente-dev NON si crea nel seed** (niente password in git). Scartato il
  design iniziale «CTE utente-dev in `auth.users`» perché committava una password
  reale su progetto Supabase condiviso — respinto dal revisore in T-007
  (`dossier/T-007-hardening-grant-anon.md` → Attriti → «Respinto del revisore
  (g5)»). Scelto: utente creato fuori da git, seed che aggancia per email.

## Stato e piano (pronto da eseguire)
1. **Prerequisito**: creare l'utente-dev `dev@shaer.it` fuori da git — signup
   dall'app oppure Supabase → Auth → Users → Add user (password scelta lì, mai
   committata).
2. Eseguire `supabase/seed.sql` nel SQL editor del progetto `alrguvxspssjwfmtuhdw`.
3. **Prova**: query `select count(*) from public.qr_codes where short_code in
   ('devsite1','devdocs1','devnone1')` → 3; `select count(*) from public.qr_scans
   s join public.qr_codes q on q.id=s.qr_id where q.short_code='devsite1'` → 6.
   Oppure: login come dev nell'app, aprire `devsite1`, vedere la timeline piena.
4. Ri-eseguire il seed una seconda volta e riverificare i conteggi (**idempotenza**:
   restano 3 e 6, nessun duplicato).
5. A prova fatta: T-009 → `[x]`, dossier in archivio.

## Attriti
Nessuno finora: task nato dallo scorporo di T-007, non ancora eseguito.
