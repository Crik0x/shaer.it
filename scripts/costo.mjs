// Misura il costo fisso del metodo: i token dei file caricati a ogni sessione.
//
// L'impalcatura di un metodo cresce in silenzio: ogni regola aggiunta sembra
// gratis, e il conto arriva quando il biglietto d'ingresso si mangia il lavoro.
// Qui il costo e' un numero misurato a ogni apertura e storicizzato, cosi' la
// crescita si vede mentre accade invece che a danno fatto.
//
//   node scripts/costo.mjs            misura, stampa, scrive una riga in costo.csv
//   node scripts/costo.mjs --check    misura in silenzio, esce 1 oltre il tetto duro
//
// Regole in .claude/rules/lavoro.md §10.

import { readFileSync, existsSync, appendFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const BUDGET = 6000;   // avviso: si pota
const TETTO = 8000;    // blocco: il pre-commit si ferma

// Stima dei token. L'italiano in markdown sta intorno ai 3,8 caratteri per token:
// piu' denso dell'inglese per via di articoli e desinenze. E' una stima, e va
// bene che lo sia — serve a vedere la CURVA, non a certificare un numero.
const stimaToken = (testo) => Math.round(testo.length / 3.8);

// I file che il modello carica a ogni singola sessione, senza chiederlo.
// Sono gli unici che contano: REGISTRO, DECISIONI e docs/ si aprono mirati.
const SEMPRE_CARICATI = [
  'CLAUDE.md',
  '.claude/rules/lavoro.md',
  'memoria/STATO.md',
  'memoria/TODO.md',
  'memoria/LEZIONI.md',
];

// Di comandi e agenti il modello vede sempre la descrizione nel frontmatter,
// anche quando non li invoca. Il corpo lo legge solo su chiamata.
function descrizioni() {
  const voci = [];
  for (const cartella of ['.claude/commands', '.claude/agents']) {
    const percorso = join(ROOT, cartella);
    if (!existsSync(percorso)) continue;
    for (const nome of readdirSync(percorso).filter((f) => f.endsWith('.md'))) {
      const testo = readFileSync(join(percorso, nome), 'utf8');
      const fm = testo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const desc = fm?.[1].match(/description:\s*(.+)/)?.[1] ?? '';
      voci.push({ file: `${cartella}/${nome}`, token: stimaToken(desc) });
    }
  }
  return voci;
}

const voci = SEMPRE_CARICATI.map((f) => {
  const percorso = join(ROOT, f);
  const testo = existsSync(percorso) ? readFileSync(percorso, 'utf8') : '';
  return { file: f, token: stimaToken(testo), mancante: !existsSync(percorso) };
});

const meta = descrizioni();
const tokenMeta = meta.reduce((s, v) => s + v.token, 0);
const totale = voci.reduce((s, v) => s + v.token, 0) + tokenMeta;

const CSV = join(ROOT, 'memoria/costo.csv');
const precedente = (() => {
  if (!existsSync(CSV)) return null;
  const righe = readFileSync(CSV, 'utf8').trim().split('\n').filter(Boolean);
  if (righe.length < 2) return null;
  return Number(righe.at(-1).split(',')[1]);
})();

const check = process.argv.includes('--check');

if (!check) {
  const oggi = new Date();
  const data = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}-${String(oggi.getDate()).padStart(2, '0')}`;
  const delta = precedente === null ? '' : totale - precedente;
  if (!existsSync(CSV)) writeFileSync(CSV, 'data,token,delta\n');
  appendFileSync(CSV, `${data},${totale},${delta}\n`);

  const larghezza = Math.max(...voci.map((v) => v.file.length), 22);
  console.log('\n  Costo fisso del metodo\n');
  for (const v of [...voci].sort((a, b) => b.token - a.token)) {
    const nota = v.mancante ? '  (assente)' : '';
    console.log(`  ${v.file.padEnd(larghezza)}  ${String(v.token).padStart(5)}${nota}`);
  }
  console.log(`  ${'descrizioni comandi+agenti'.padEnd(larghezza)}  ${String(tokenMeta).padStart(5)}`);
  console.log(`  ${'─'.repeat(larghezza + 7)}`);
  console.log(`  ${'TOTALE'.padEnd(larghezza)}  ${String(totale).padStart(5)}   (~${(totale / 200000 * 100).toFixed(1)}% della finestra)`);
  if (precedente !== null) {
    const d = totale - precedente;
    console.log(`  ${'delta'.padEnd(larghezza)}  ${(d >= 0 ? '+' : '') + d}`);
  }
  console.log('');
  if (totale > TETTO) console.log(`  ⛔ Oltre il tetto duro di ${TETTO}: il pre-commit blocca. Potare adesso.\n`);
  else if (totale > BUDGET) console.log(`  ⚠️  Oltre il budget di ${BUDGET}. Vedi /costo per cosa potare.\n`);
  else console.log(`  ✅ Sotto il budget di ${BUDGET}.\n`);
}

if (check && totale > TETTO) {
  console.error(`costo: ${totale} token, oltre il tetto di ${TETTO}. Pota prima di committare.`);
  process.exit(1);
}
