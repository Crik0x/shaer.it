# Shaer.it — Product Requirements Document (PRD) · Ecosistema

Versione: 0.1 · Stato: **SKELETON — da riempire (task T-025)** · 2026-07-28
Padre: [MDD](MDD.md) · Tecnica: [SAD](SAD.md) *(da creare)* · Dominio: [SHAER_MASTER](../SHAER_MASTER.md)

> **Questo è uno skeleton pre-impostato**, non un PRD completo. Fissa la **struttura**
> e la **roadmap dei requisiti** (fatto/da fare) allineata all'[MDD](MDD.md) §5 e §10 e
> al saldo di `memoria/TODO.md`. Ogni epica va poi **riempita** con requisiti e
> **criteri di accettazione testabili** (regola 5: se è calcolabile, è un test; `[~]`
> solo per il visivo). Legenda: ✅ fatto · ◐ in corso · ▢ da fare.
>
> Priorità **MoSCoW**: `M` must · `S` should · `C` could · `W` won't-now.

---

## Attori (dettaglio in MDD §3)

BUYER (+SHAERER) · SELLER · PRODUCER · TRANSPORTER · ADMIN · *periferici:* FORNITORE,
COMMERCIALISTA, DIPENDENTE. — *Requisiti di registrazione/verifica: da scrivere.*

## Mappa epiche → modulo → blocco → stato

| Epica | Modulo (MDD §5) | Blocco (MDD §10) | Stato |
|-------|------------------|-------------------|-------|
| **EE0** · Verifica via QR | 0 | F0 | ✅ (vedi [modulo-qr/PRD](../modulo-qr/PRD.md)) |
| **EE1** · Identità, Wallet, RBAC admin-first | 1 | B1 | ▢ |
| **EE2** · TXN Engine (stati, unica verità) | 2 | B2 | ▢ |
| **EE3** · Economia crediti (ledger, pool/escrow, 3 classi) | 3 | B3 | ▢ |
| **EE4** · Recensioni & Rank bayesiano | 4 | B4 | ▢ |
| **EE5** · Referral promo (mono-livello, a tempo) | 5 | B5 | ▢ |
| **EE6** · Wishlist/Compleanni/Crowdfunding/Gruppi — *da subito* | 6 | B6 | ▢ |
| **EE7** · Pannello unico + catalogo/trial | — | B7 | ▢ |
| **EE8** · QR operativo + incentivi + escrow | 0→ | B8 | ▢ |
| **EE9** · Moduli operativi (magazzino/riordino/presenze/export) | op. | B9 | ▢ |
| **EE10** · Prenotazioni · Shop · Fidelity universale · CMS | 7-9,12 | B10 | ▢ |
| **EE11** · MLM-as-a-service · Billing SaaS | 10,15 | B11 | ▢ |
| **EE12** · Tracciabilità & Trasporto | 11 | B12 | ▢ |
| **EE13** · Analytics ecosistema · Automazioni | 13,14 | F3 | ▢ |
| **EE14** · API & Enterprise | 16 | F4 | ▢ |

---

## EE1 · Identità, Wallet & RBAC admin-first `B1`

*Da scrivere.* Requisiti-chiave attesi: profilo utente + multi-ruolo (C35, 3 wallet);
saldo **derivato** dal ledger; **RBAC admin-first** (E-D-13): l'admin Shaer assegna
permessi scelti uno a uno a un utente; **maker-checker** prima di ogni modifica
permanente. *Criteri:* test su RLS owner-scoped; test sul gate di approvazione.

## EE2 · TXN Engine `B2`
*Da scrivere.* Macchina a stati `OPEN→SUGGESTED→IN_PROGRESS→COMPLETED→(EXPIRED/ABANDONED)`;
la TXN è l'unica fonte di verità; ogni evento (suggerimento, vendita, reward, recensione)
si **appende** al TXN.

## EE3 · Economia crediti `B3`
*Da scrivere.* 6 conti; **partita doppia** (somma zero); 3 classi `promo/purchased/earned`;
**pool/escrow** (bonus bloccati, circuito chiuso E-D-16); saldo mai memorizzato;
invariante di solvibilità. *Fonte:* SHAER_MASTER §1.4 + simulatore v5.

## EE4 · Recensioni & Rank `B4`
*Da scrivere.* 10 stelle/categoria, solo da TXN `completed`, rank bayesiano (soglia 3),
moltiplicatore Shaerer. *Fonte:* SHAER_MASTER §1.5.

## EE5 · Referral promo `B5`
*Da scrivere.* Programmi **mono-livello**, parametrici e a tempo; reward solo sul diretto;
scadenza legata al programma; versionamento senza rompere gli accordi maturati (§13 MDD).

## EE6 · Wishlist / Compleanni / Crowdfunding / Gruppi `B6` — *priorità da subito*
*Da scrivere.* Compleanni amici (registrati o no); contributo a raccolta per il regalo
in wishlist (**revoca 2h**, C SHAER §1.6); gruppi/obiettivi personali e comunitari;
segnale d'interesse (acquistato sì/no, quanto fa → ri-suggestione 6m/1a).

## EE7 · Pannello unico + catalogo/trial `B7`
*Da scrivere.* Un solo pannello filtrato per ruolo; voci inattive visibili (`PRESTO`);
attivazione **trial** dall'ADMIN a tutti/categoria/singolo (E-D-14).

## EE8 · QR operativo + incentivi + escrow `B8`
*Da scrivere.* QR per postazione/tavolo/dipendente (QR personale abbinato al profilo
utente, nomi modificabili); attribuzione vendite; **motore incentivi** team/singolo
(soglie fatturato, %, min/max); **escrow con arbitrato** e circuito chiuso (E-D-15/16,
esempio ristorante MDD §5.4).

## EE9 · Moduli operativi `B9`
*Da scrivere.* Magazzino (stock, scadenze), Riordino automatico al fornitore,
Presenze/Check-in dipendenti, Export commercialista (MDD §5.3).

## EE10 · Prenotazioni · Shop · Fidelity universale · CMS `B10`
*Da scrivere.* Riferimento build plan (Sprint 2-6) riletto per Shaer; fidelity =
wallet universale, non per-tenant (E-D-03).

## EE11 · MLM-as-a-service · Billing SaaS `B11`
*Da scrivere.* Motore MLM parametrico (profondità/larghezza, E-D-01/B); finanziamento
campagne (budget+split+commissione admin, E-D-11); billing per-modulo (pay-per-activation).

## EE12 · Tracciabilità & Trasporto `B12`
*Da scrivere.* Hand-off via scansione QR; dati real-time operatore+dispositivo; modalità
(nave/terra/aereo); condivisione **chirurgica**; esposizione al consumatore di
distanza/costo trasporto (MDD §5.2). *Nodo aperto:* privacy tracking dipendenti (§13 MDD).

## EE13 · Analytics ecosistema · Automazioni `F3` · EE14 · API & Enterprise `F4`
*Da scrivere più avanti.*

---

## Requisiti non-funzionali (eredità dal Modulo 0, estesi)

Sicurezza (RLS + confine DB, L-001) · **compartimentazione** (E-D-09) · privacy/consenso
(PII e tracking) · performance (Server Components, `dynamic`, streaming) · affidabilità
(un QR pubblicato non si rompe mai, regola 7) · testabilità (dominio in funzioni pure).
