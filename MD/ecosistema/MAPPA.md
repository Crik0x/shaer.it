# MAPPA — l'atlante di Shaer.it

> **Cos'è.** La **vista trasversale** che gli altri file non tengono in un posto solo:
> chi sono i **profili**, in quale **pannello** entrano, quali **servizi** usano, e a
> che punto è la **costruzione** di ciascuno. È una mappa di *puntatori*: il contenuto
> di dominio resta nelle sue fonti (`MDD.md`, `PRD.md`, `SAD.md`, `MODULO-7-GESTIONALE.md`).
> Qui non si duplica — si **collega** e si tiene il **registro delle incongruenze aperte**.
>
> **Non auto-caricato.** Si apre quando serve orientarsi o riordinare lo scope.
>
> **Manutenzione.** Si aggiorna a ogni `/chiusura` (come STATO). In futuro lo rigenererà
> l'**agente architetto/PM** → `futuro/agente-architetto-pm.md`.

---

## 1 · I profili — autorità: `MDD.md §3` · decisione **E-D-32**

Tre profili top-level. Un utente ha **sempre** il suo profilo personale; il business è
un'**attivazione** sopra, con **pulsante switch** consumatore↔business (fino a 3 ruoli, C35).

| Profilo | Come si ottiene | Verifica | Note |
|---|---|---|---|
| **ADMIN** | si registra come utente, poi **elevato dal DB** (`admins`, monitorabile — E-D-33) | **2FA obbligatoria** | più ADMIN con `role`/`powers` (preimpostati); **gestisce tutti i profili** (finestra RLS); capability esclusive |
| **UTENTE** (consumatore) | registrazione base | email | scan, wallet, cashback, wishlist; include la modalità **SHAERER** (referral). Resta anche dopo l'upgrade a business |
| **BUSINESS** | **attivazione** dal profilo utente (switch) | documentale (P.IVA) | il **sotto-tipo** sblocca viste/funzioni diverse |

**Sotto-tipi BUSINESS** — mappano i 4 attori-filiera del MDD §3:

| Sotto-tipo | = attore MDD | Cosa fa |
|---|---|---|
| **commerciante** | SELLER | vende al buyer; owner di QR |
| **produttore** | PRODUCER | emette lotti; owner nodi radice / `granted_by` |
| **libero professionista** | (PRO) | servizi su prenotazione (Gestionale, Mod. 7) |
| **intermediario / trasporti** | TRANSPORTER | corriere/logistica; connette imprenditori e piattaforme via Shaer.it |

**Ruoli periferici** (relazioni, non registrazioni): **FORNITORE** (business in B2B) ·
**COMMERCIALISTA** (destinatario dati read-only, revocabile §11) · **DIPENDENTE** (utente
assegnato da un business, **permessi a scheda** RBAC §8.1, performance via QR operativo §5.4).

## 2 · Il pannello — autorità: `MDD.md §8` · decisione locked

**Un solo pannello, accessi granulari (RBAC), maker-checker.** Chi entra vede **solo le
schede e i dati** che il suo ruolo abilita. Nessuna azione irreversibile in solitaria per
i dipendenti (verifica/approvazione obbligatoria). Ambito attuale **admin-first**: la
profondità dei permessi si collauda solo lato ADMIN; poi la stessa capacità passa al SELLER.

- **E-D-31 [LOCKED].** Il pannello unico **routa a home diverse per ruolo** (ADMIN / utente /
  business atterrano su viste distinte sulla stessa base auth+dati). *Unico ora, splittabile poi*:
  raffina il §8.1, **non** lo riapre. **ADMIN protetto da 2FA** (E-D-32).
- **E-D-33 [LOCKED].** Maker-checker **a soglia (multisig)**: `required_approvals` + firme distinte,
  ≠ dal maker. Interno agli ADMIN (verifica il personale ADMIN) **e propagabile al business** (il
  titolare assegna N verificatori su uno scope, es. contabilità). Stessa macchina, due contesti.
- Catalogo servizi **sempre visibile** anche se non attivo (badge `PRESTO`) + trial da ADMIN (§8.2).

## 3 · I servizi (catalogo moduli) — autorità: `MDD.md §5`

Stato verificato sulla realtà: **solo il Modulo 0 esiste come codice**, il resto è visione.
Fasi: **F1** economia · **F2** servizi business · **F3** rete&intelligenza · **F4** scala.
Qui solo *stato + aggancio task*; i dettagli di ogni modulo vivono in `MDD.md §5`.

| # | Modulo | Fase | Stato | Task / dossier |
|---|---|:---:|---|---|
| **0** | QR / Verifica | F0 | **✅ costruito e provato** | Modulo 0 (`apps/qr`) |
| 1 | Identità & Wallet | F1 | 🔴 motore RBAC puro 10/10; layer DB da fare | **T-030** · `dossier/T-030-rbac.md` |
| 2 | TXN Engine | F1 | 🔴 stabilisce il tronco TXN | **T-031** |
| 3 | Economia a crediti (ledger) | F1 | 🟢 **ledger core chiuso** (T-029, 4/4) | T-029 ✅ · T-032/033 aperti |
| 4 | Recensioni & Rank bayesiano | F1 | 🔴 | **T-034** |
| 5 | Referral (promo Shaer, mono-livello) | F1–F3 | 🔴 | **T-035** |
| 6 | Wishlist · Compleanni · Crowdfunding | F1–F2 **subito** | 🔴 priorità alta (Nick) | — da aprire |
| 7 | **Gestionale attività** (assorbe Prenotazioni) | F2 | 🔴 schema money-ready OFF | **T-042→T-043** · `MODULO-7-GESTIONALE.md` |
| 8 | Shop (catalogo, ordini, PSP terzo) | F2 | 🔴 | — |
| 9 | Fidelity universale (wallet di rete) | F2–F3 | 🔴 (`[BLOCCATO su F1]`) | **T-041** |
| 10 | MLM-as-a-service (parametrico) | F2–F3 | 🔴 | — |
| 11 | Tracciabilità & Trasporto | F2–F3 | 🔴 | — |
| 12 | CMS (pagine/articoli business) | F2 | 🔴 | — |
| 13 | Analytics ecosistema | F3 | 🟡 esteso dal Mod. 0 | — |
| 14 | Automazioni & Marketing | F3 | 🔴 | — |
| 15 | Billing SaaS (pay-per-activation) | F2 | 🔴 | T-016 (piano free/pro) tocca qui |
| 16 | API & Enterprise | F4 | 🔴 | — |

🟢 provato · 🟡 parziale · 🔴 visione. Le feature 💰 sono bloccate dal ledger F1 finché TXN non gira.

## 4 · La cross-map — profilo × vista × servizi

*(la vista che manca altrove: chi tocca cosa. Si riempie man mano che i moduli nascono.)*

| Profilo | Home del pannello | Servizi che usa |
|---|---|---|
| **BUYER** | vista cliente (scan, wallet, cashback, wishlist) | 0,1,3,4,5,6,9 |
| **SELLER** (business) | vista business = **Gestionale** (Mod. 7) | 0,7,8,10,11,12,13,14,15 + attivazioni |
| **PRODUCER** | vista business + lotti/tracciabilità | 0,7,11,13 |
| **TRANSPORTER** | vista operativa (hand-off lotto) | 0,11 |
| **ADMIN** | pannello completo + config commissioni/trial | tutti + `fee_rules`/`plans` |
| DIPENDENTE | schede del business che lo abilita (RBAC) | sottoinsieme del SELLER |

## 5 · Stato di costruzione — autorità: `memoria/STATO.md` + `TODO.md`

- **Esiste e provato:** Modulo 0 (QR albero, scan, analytics, auth, RLS) · **Ledger core** (T-029).
- **In corso:** RBAC (T-030 — motore puro verde, layer DB `[N]`).
- **Prossimo bivio dopo T-030:** T-031 (TXN) oppure T-042 (schema Gestionale G1).
- Saldo task e prova completa: **non qui** → `TODO.md` (saldo) e `REGISTRO.md` (prova).

## 6 · Incongruenze — registro

*(cresce quando emerge un conflitto, cala quando Nick decide → la decisione va in `DECISIONI.md`)*

**Sciolte il 2026-07-30:**

1. ✅ **Profili** → **E-D-32**: 3 top-level (ADMIN interno 2FA · UTENTE base · BUSINESS come
   attivazione con switch) + 4 sotto-tipi business. I 5 attori del MDD §3 mappano nei sotto-tipi (§1).
2. ✅ **Intermediario** → **E-D-32**: è il sotto-tipo business **trasporti/corriere** (= TRANSPORTER),
   non la modalità SHAERER. Si registra come business.
3. ✅ **Modulo 7** → aggiornato `MDD §5`: «Gestionale attività» assorbe le Prenotazioni.

**Aperte:** nessuna.
