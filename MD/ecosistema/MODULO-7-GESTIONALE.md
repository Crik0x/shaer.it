# Modulo 7 — Gestionale attività (STUDIO)

> **Cos'è.** Il pannello con cui un'attività verificata (salone, ristorante, altro)
> gestisce *dipendenti, catalogo (servizi + prodotti), pacchetti/offerte, presenze,
> abilitazioni* e — più avanti — *prenotazioni, storico cliente, vendite*. È il
> **Modulo 7** del MDD (era F2), anticipato su richiesta di Nick (2026-07-30).
>
> **Non auto-caricato.** Si apre mirato quando si lavora al gestionale.
>
> Fonti: `MDD.md §5` (moduli) · `DOMANDE-NICK` Q-MINT.1 (modello economico) ·
> riferimenti UI: `Struttura/prenotazioni.html` e `D:/Desktop/Arkés/GiT/Admin/
> arkes_admin_panel_v14.html` (struttura, **non** palette) · `Struttura/Schema/
> Shaer_it_Simulatore_MVP_v5.html` (CRM/economia, a valle).

---

## 1 · Cosa abbiamo già (verificato sulla realtà — regola 1)

| Fondamenta | Stato | Dove |
|---|---|---|
| **Modulo 0 QR** — albero `qr_codes` (`parent_id`+`owner_id`+`granted_by`+`purpose`), `qr_scans` append-only, resolve, analytics | ✅ in produzione | `apps/qr/`, migrazioni `2026072[4-6]*` |
| **Auth + profiles** + RLS multi-tenant | ✅ | `20260727000001_profiles.sql` |
| **Ledger F1 core** — `accounts`, `ledger_journal`, `ledger_postings`, RPC `ledger_post` transfer-only + anti-scoperto universale (2 exploit rifiutati, test verde 4/4) | ✅ provato | `20260729000001_ledger_core.sql`, `lib/ledger.test.ts` |
| **Modello economico** deciso | ✅ | `SHAER_MASTER §1.4`, `DOMANDE-NICK` Q-SOLV/Q-MINT |

**Non esiste ancora nessuna tabella** di attività/dipendenti/prodotti/servizi/
prenotazioni. Il gestionale nasce da zero, additivo (regola 5).

## 2 · Cosa manca — la visione finale (da Nick, 2026-07-30)

Il flusso completo che Nick ha descritto, per memoria:

1. **Registrazione business** — sceglie *tipo attività*, *n. attività*, *n. dipendenti*;
   carica **documenti di titolarità** (KYC → verify-gate di T-030).
2. **Setup profilo attività** — es. «salone di bellezza»: compila i campi, definisce
   **servizi** `{titolo, descrizione, tempo, prezzo}` e **prodotti** `{titolo,
   descrizione, prezzo, scadenza, categoria, SKU}`.
3. **Vetrina pubblica** — il business compone menu/vetrina: ciò che l'utente vede
   arrivando sulla sua pagina.
4. **Pacchetti/offerte** — sconti con scadenza; bundle di prodotti+servizi insieme
   (Arkés v14: `prezzoPieno` vs `prezzoPacchetto`, `componenti[]`, `badge[]`).
5. **Prodotti dalla rete** — un prodotto nasce idealmente dal **produttore** con un
   **codice univoco**; il business lo aggancia collegandosi alla rete Shaer.it.
   *Finché non ci sono produttori*, il business inserisce i **propri** prodotti.
   Un'attività può vendere **anche prodotti di un partner** con cui ha un accordo.
6. **Multi-attività** — il business aggiunge una seconda attività/salone e da **un
   solo gestionale** governa più attività (prenotazioni/calendari/tavoli/prodotti
   **separati**), con una **dashboard-riassunto** che tiene tutto sotto controllo
   (rif. admin damascati `D:/Desktop/I Damascati/.../apps/public/app/admin`).
7. **Prenotazioni** — calendario, slot/tavoli, widget pubblico, email conferma.
8. **Storico cliente / CRM** — il commerciante vede, per cliente: abitudini,
   acquisti, prenotazioni eseguite/annullate, € spesi, clienti *suggeriti* venuti
   tramite lui, prodotti/servizi consigliati agli amici, il più consigliato
   (modello simulatore v5).
9. **Pagamenti** — vendita in SHAER 100% o mix SHAER/€ deciso dal commerciante;
   **commissione a Shaer.it sempre** (anche in contanti); **payout** stile Stripe
   (giorno/settimana/mese).

## 3 · Il taglio — cosa entra ORA e cosa aspetta (con il perché)

Decisioni prese in intake 2026-07-30: **prima fetta = solo gestionale/admin
single-activity**, **schema money-ready ma pagamento OFF**, **modello generico
multi-verticale**, **dipendente = entità separata che referenzia il QR**,
**dipendente vede solo le proprie + ruoli-template con scadenza**.

### ✅ Fase G1 — Gestionale admin single-activity (la prima fetta)
- Schema Supabase money-ready (ogni tabella `owner_id`+RLS), pagamento inerte.
- CRUD nella dashboard: attività, servizi, prodotti, pacchetti/offerte, staff,
  ruoli-template con scadenza, vetrina in bozza (flag `public`).

### ⏸ Rinviato — ognuno col suo sblocco
| Pezzo | Perché aspetta | Sblocca da |
|---|---|---|
| Booking cliente (calendario/widget/email) | fuori prima fetta (scelta Nick) | **prototipo di Nick** → intake Sprint 3 |
| Storico cliente / CRM / suggeriti | serve la spesa reale = transazioni | **TXN engine (T-031)** + simulatore v5 |
| Multi-attività + dashboard-riassunto | prima la singola attività | G1 |
| Rete produttori / SKU condivisi | non esistono produttori su Shaer.it | fase rete |
| Verifica documenti titolare (KYC) | è il verify-gate | **T-030** |
| Vetrina pubblica (rendering) | prima il catalogo che la alimenta | G1 |
| Pagamenti SHAER/€ + payout | pagamento OFF (scelta ibrida) | **T-031/033 + webhook Stripe** |

## 4 · Modello dati G1 (proposta — money-ready, pagamento OFF)

Derivato da Arkés v14 + risposte Nick. Nomi provvisori, da fissare sullo schema.

- **`businesses`** — `id, owner_id, name, vertical('salone'|'ristorante'|'altro'),
  verified(bool, stub), created_at`. *(La multi-attività nasce già qui: più righe
  stesso `owner_id`; la dashboard-riassunto è G-oltre.)*
- **`sedi`** *(opzionale G1)* — una `business` può avere più sedi (Arkés ha `sede`).
- **`offerings`** — entità **unica** verticale-agnostica per servizi **e** prodotti:
  `id, business_id, kind('service'|'product'), title, description, price_eur,
  price_shaer(inerte), public(bool)`.
  - service-only: `duration_min`, operatore/i abilitati (via `staff_offerings`).
  - product-only: `sku, category, expiry, producer_code(self per ora)`.
- **`bundles`** — `id, business_id, title, price_full, price_bundle, discount_end`;
  **`bundle_items`** (`bundle_id, offering_id`) = i componenti (prodotti+servizi).
- **`staff`** — **entità separata**: `id, business_id, name, active,
  qr_node_id(FK→qr_codes, NULLABLE)`. Il legame col QR è opzionale (check-in fisico).
- **`staff_offerings`** — `staff_id, offering_id` = la matrice «chi fa cosa»
  (Arkés `opsServizi`).
- **`role_templates`** — `id, business_id, name, permissions(jsonb)` = ruoli
  preimpostati dal titolare.
- **`staff_roles`** — `staff_id, role_template_id, expires_at(NULLABLE)` = ruolo
  assegnato **con scadenza** (requisito Nick). *Consumato da T-030/RBAC.*
- **`badges`** *(da Arkés, valutare in G1)* — certificazioni/skill su offering o
  staff, con `scadenza`. Modello `META{badges:[{key,scadenza}]}` di v14.

**Presenze** (Arkés `presenze{opId: stato}`): tabella `attendance` append-only,
idealmente alimentata da **scan QR** (riusa Modulo 0) invece che da stato mutabile.

## 5 · La sequenza (stabilisce → consuma)

Il gestionale **consuma RBAC**, che è **T-030**, già prossimo nella sequenza
ledger F1. Nessun conflitto: T-030 va comunque prima e nasce includendo i
role-template con scadenza che servono qui.

1. **T-030 · RBAC** — identità/ruoli + role-template con `expires_at` + verify-gate
   (stub KYC). *Fonda ciò che G1 consuma.* (SAD §3.1/4/6)
2. **T-042 · Schema gestionale G1** — le tabelle §4, money-ready OFF. *(nuovo)*
3. **T-043 · CRUD admin G1** — servizi/prodotti/pacchetti/staff/ruoli in dashboard,
   estetica Stripe/Vercel (regola 8), Server Components (regola 9). *(nuovo)*
4. Poi, ordine da decidere: multi-attività → booking (prototipo Nick) → CRM (post-TXN).

## 6 · Materiali di intake da consumare al momento giusto
- **Booking**: prototipo di Nick → intake dedicato allo Sprint 3.
- **`arkes_admin_panel_v14.html`**: struttura UI dell'admin (tab, matrice, pacchetti)
  → guida T-043 (la UI, non la palette gold/serif).
- **`Shaer_it_Simulatore_MVP_v5.html`**: motore economico + CRM/suggeriti/recensioni
  → guida la fase CRM (post-TXN) e conferma F1.
- **admin damascati**: riferimento dashboard multi-attività → fase multi-attività.
