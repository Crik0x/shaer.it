// Misura la RESA del metodo: cosa ha intercettato, non cosa costa.
//
// Il costo del metodo si misura da sempre (costo.mjs). La resa no: il metodo
// sapeva pesarsi ma non sapeva dire se valeva. Un impianto che dichiara «misura,
// non stimare» e poi non misura il proprio ritorno pratica a meta' cio' che
// predica. Questo script e' la controparte del costo — registra, a ogni
// chiusura, cio' che il metodo ha impedito che si perdesse.
//
// Le quattro cose che il metodo esiste per intercettare:
//   P  precedenti riusati   — un dossier/pattern letto invece di ri-derivare
//   D  declassamenti        — un [x] falso sceso a [~]: un «fatto» non provato colto
//   C  lezioni convertite   — una lezione diventata test/tipo/hook: protezione a costo zero
//   R  riporti fermati      — un task arrivato a ↻3 e portato a Nick invece che ri-rimandato
//
//   node scripts/resa.mjs                      riepiloga lo storico
//   node scripts/resa.mjs --registra P D C R   aggiunge la riga di oggi (interi >= 0)
//
// Regole in .claude/rules/lavoro.md §10-bis. Nessun tetto: la resa non si pota,
// si accumula. Non entra nei file sempre caricati — costa zero contesto.

import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV = join(ROOT, 'memoria/resa.csv');
const INTESTAZIONE = 'data,precedenti_riusati,declassamenti,lezioni_convertite,riporti_fermati';

const COLONNE = [
  ['precedenti_riusati', 'precedenti riusati invece di ri-derivati'],
  ['declassamenti', '[x] falsi colti e scesi a [~]'],
  ['lezioni_convertite', 'lezioni diventate test/tipo/hook'],
  ['riporti_fermati', 'riporti fermati a ↻3 e portati a Nick'],
];

function oggi() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function righe() {
  if (!existsSync(CSV)) return [];
  return readFileSync(CSV, 'utf8').trim().split('\n').slice(1).filter(Boolean)
    .map((r) => r.split(',').map((c, i) => (i === 0 ? c : Number(c))));
}

const args = process.argv.slice(2);
const iReg = args.indexOf('--registra');

// ── registrazione: aggiunge la riga di oggi ─────────────────────────────────
if (iReg !== -1) {
  const nums = args.slice(iReg + 1, iReg + 5).map(Number);
  if (nums.length < 4 || nums.some((n) => !Number.isInteger(n) || n < 0)) {
    console.error('Uso: node scripts/resa.mjs --registra P D C R  (quattro interi >= 0)');
    process.exit(1);
  }
  if (!existsSync(CSV)) writeFileSync(CSV, INTESTAZIONE + '\n');
  appendFileSync(CSV, `${oggi()},${nums.join(',')}\n`);
  console.log(`\n  Resa registrata: ${oggi()} — P${nums[0]} D${nums[1]} C${nums[2]} R${nums[3]}\n`);
  process.exit(0);
}

// ── riepilogo: cosa il metodo ha intercettato finora ────────────────────────
const dati = righe();
if (dati.length === 0) {
  console.log('\n  Resa del metodo: ancora nessuna sessione registrata.');
  console.log('  Si popola a ogni /chiusura. Finche\' e\' vuota, il metodo si sa pesare');
  console.log('  ma non ancora dimostrare — ed e\' questo il buco che colma.\n');
  process.exit(0);
}

const somme = COLONNE.map((_, c) => dati.reduce((s, r) => s + (r[c + 1] || 0), 0));
const larghezza = Math.max(...COLONNE.map(([, t]) => t.length));
const ultima = dati.at(-1);

console.log(`\n  Resa del metodo — ${dati.length} sessioni registrate\n`);
COLONNE.forEach(([, testo], c) => {
  console.log(`  ${testo.padEnd(larghezza)}  ${String(somme[c]).padStart(4)}`);
});
console.log(`  ${'─'.repeat(larghezza + 6)}`);
const totale = somme.reduce((s, n) => s + n, 0);
console.log(`  ${'intercettati in tutto'.padEnd(larghezza)}  ${String(totale).padStart(4)}`);
console.log(`\n  Ultima sessione (${ultima[0]}): P${ultima[1]} D${ultima[2]} C${ultima[3]} R${ultima[4]}\n`);
