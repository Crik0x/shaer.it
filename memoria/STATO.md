# Stato

Fotografia: si **riscrive**, non si accumula. È il solo file di memoria che si
riscrive. Tetto 3 KB.

**Apertura:** `95aa0f8`

## Dove siamo

Sessione 2026-07-27c (autonoma) **chiusa**: chiusi i tre bug dal feedback di Nick nel modo che
la realtà permetteva. **T-021** (nav landing consapevole del login) e **T-023** (selettore periodo
senza scroll-to-top) hanno **codice completo + tsc + revisore approvato**, ma restano `[~]`: il loro
comportamento vive **dietro auth** e Claude non autentica → serve l'**eyeball di Nick** su :3000 per
promuoverli. **T-022** ha chiuso il **blocco A**: tabella `profiles` come fondazione per-utente
(migrazione `20260727000001`, applicata al DB dev da Nick), `profiles.test.ts` + `grants.test.ts`
verdi, revisore ok → incisa **D-014** (aggiorna D-013: le funzioni pure guadagnano un parametro
`timeZone`). B/C/D di T-022 restano col piano pronto nel dossier. Il distillatore ha nominato la **4ª
recidiva** del muro «auth non testabile in-browser» → nato **T-024** (harness SSR-cookie → route Next).

## Cosa esiste

- **Nav landing auth-aware (T-021, `[~]`)**: `app/_components/site-header.tsx` async, `getUser()` →
  Dashboard + form logout `/auth/signout` da loggato, Accedi/Registrati da anonimo.
- **Selettore periodo senza salto (T-023, `[~]`)**: `scroll={false}` sui Link del periodo in
  `dashboard/page.tsx` e `dashboard/qr/[short_code]/page.tsx` (doc Next `link.md §scroll`).
- **Fondazione profiles (T-022/A, provata)**: `public.profiles` (1:1 auth.users, PK owner_id,
  `timezone` default 'UTC', country, city) + RLS owner-scoped + trigger `on_auth_user_created`
  (`handle_new_user` definer, revoca L-001) + backfill. Test `profiles.test.ts`.
- **Dashboard aggregata + singolo QR** (T-014/T-015/T-019), **albero+rollup** (T-012), **landing** (T-011).
- Pre-commit §7–§11 attivo. Motore analitico puro in `lib/dashboard.ts` (16/16).

## Cosa NON esiste ancora

- **T-022 B/C/D**: funzioni pure TZ-aware (param `timeZone`, default UTC), wiring + preferenza dal
  browser (chiude il debito `updated_at`), toggle Giorno/Ora. Piano in `dossier/T-022-fuso-cliente.md`.
- **T-024** harness verifica auth · **T-016** piano free/pro (Stripe D-011, estende `profiles`) ·
  **T-017** restyling (Arkés D-012) · **T-018** editor QR · **T-020** slug+@tag (consuma T-016).
- **Azioni di Nick `[N]`**: **N-f** chiavi Stripe in Vercel · **T-008** Supabase prod (`↻3`).

## Note operative

- **Comportamento dietro auth non eyeball-abile da Claude** (non crea account / non digita password):
  gate finale = eyeball di Nick, finché T-024 non costruisce l'harness SSR-cookie → route Next.
- **DDL non applicabile da Claude**: `.env.local` ha solo anon key + URL → migrazioni = azione `[N]`
  (SQL editor). Test d'integrazione: `node --test --env-file=.env.local apps/qr/lib/*.test.ts`.
- **profiles.timezone** = IANA (es. 'Europe/Rome'); il dato resta UTC, il display converte (D-013/D-014).
- DB dev `alrguvxspssjwfmtuhdw`, migrazioni 0001…profiles applicate. cwd Bash non persiste: **path assoluti**.
