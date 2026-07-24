---
task: T-001
tier: M
titolo: Scaffold dell'app Next.js 16
aree: [scaffold, toolchain, tailwind, shadcn, test]
stato: chiuso
riporti: 0
sessioni: [2026-07-24]
---

### Obiettivo
`apps/web/` con Next.js 16 (TS, Tailwind v4, App Router) + shadcn/ui, `npm run
dev` che serve la home. Raggiunto.

### Accertato (prove)
- `create-next-app` → Next **16.2.11**, node 24.18, npm 11.16.
- Home: `GET 127.0.0.1:3000/` → `200`, `<title>Create Next App</title>` + markup Next.
- shadcn init default: `components.json`, `components/ui/button.tsx`, `lib/utils.ts`,
  `app/globals.css` aggiornato. Tailwind **v4** rilevato.
- Node esegue TS nativamente (type-stripping) → test con `node --test`, zero runner.

### Decisioni
- **Base color/preset shadcn**: usato `-d` (preset `base-nova`, default ufficiale).
  Il flag `-b` NON è più il colore (ora è la libreria: base/radix/aria).
- **No `--src-dir`**: `app/` alla radice di `apps/web` (struttura più piatta).
- **Test runner**: `node:test` integrato invece di vitest/jest → nessuna libreria
  nuova (rispetta regola 10), TS girato per type-stripping.
- **Turbopack**: attivo (default create-next-app).

### Attriti
- `create-next-app` → «application path is not writable» su Windows quando `apps/`
  non esiste → causa: controllo scrittura sul parent inesistente → risolto con
  `mkdir -p apps` prima → prevenibile? no (quirk esterno, una riga).
- `shadcn init -b neutral` → errore enum (base=radix|base|aria) → il flag colore è
  cambiato tra versioni → risolto con `-d` → prevenibile? no (API di terze parti).
- `node --test lib/` (directory) → MODULE_NOT_FOUND; sul **file** singolo funziona
  → passare il path del file, non la cartella, quando la cwd non è quella del test.

### Vicoli ciechi
- `cd apps/web && ...` nella tool Bash: la cwd non persiste tra chiamate (la shell
  si re-inizializza) → usare path assoluti.
