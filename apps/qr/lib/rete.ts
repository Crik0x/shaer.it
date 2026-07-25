// Motore puro dell'albero rete (T-011) — portato da arkes.html adattato al
// dominio QR: la metrica di un nodo è `scans` (scansioni), non i volumi MLM.
// Nessun I/O, nessun DOM: tutta la logica è testabile a costo zero (§5).

export type ReteNode = {
  id: string;
  parentId: string | null;
  name: string;
  scans: number; // scansioni proprie del nodo
};

export type ReteTree = Record<string, ReteNode>;

// Geometria del layout (px). Default vicini ad arkes, sovrascrivibili.
export type LayoutOpts = { colGap?: number; rowGap?: number; margin?: number };
const DEF: Required<LayoutOpts> = { colGap: 92, rowGap: 104, margin: 54 };

// Volume massimo di riferimento per raggio/colore: satura la scala del raggio.
export const VMAX = 1600;

export function children(tree: ReteTree, id: string): ReteNode[] {
  return Object.values(tree).filter((n) => n.parentId === id);
}

// Rollup delle scansioni del sottoalbero (nodo incluso). `memo` opzionale per
// non ricalcolare O(n) volte in un render.
export function subtreeScans(
  tree: ReteTree,
  id: string,
  memo: Record<string, number> = {},
): number {
  if (memo[id] != null) return memo[id];
  const n = tree[id];
  let v = n ? n.scans : 0;
  for (const c of children(tree, id)) v += subtreeScans(tree, c.id, memo);
  memo[id] = v;
  return v;
}

// Numero di discendenti (nodo escluso).
export function subtreeSize(tree: ReteTree, id: string): number {
  const kids = children(tree, id);
  return kids.reduce((acc, c) => acc + 1 + subtreeSize(tree, c.id), 0);
}

// Profondità massima sotto `id` (0 se foglia).
export function maxDepth(tree: ReteTree, id: string): number {
  const kids = children(tree, id);
  if (!kids.length) return 0;
  return 1 + Math.max(...kids.map((c) => maxDepth(tree, c.id)));
}

// `id` sta nel sottoalbero del focus (o È il focus): risale i genitori finché
// incontra focusId. Porta rtInFocus di arkes.
export function inFocus(tree: ReteTree, id: string, focusId: string): boolean {
  let cur: string | null = id;
  while (cur) {
    if (cur === focusId) return true;
    cur = tree[cur] ? tree[cur].parentId : null;
  }
  return false;
}

export type LitEdges = { edges: Set<string>; heads: Set<string> };

// La "linea che traccia le persone sotto": le 3 gambe più forti del focus, e da
// ciascuna la spina dorsale seguendo sempre il figlio col volume maggiore.
// La chiave di un arco è `${parentId}>${childId}`.
export function litEdges(tree: ReteTree, focusId: string): LitEdges {
  const memo: Record<string, number> = {};
  const vol = (id: string) => subtreeScans(tree, id, memo);
  const edges = new Set<string>();
  const heads = new Set<string>();

  const legs = children(tree, focusId)
    .slice()
    .sort((a, b) => vol(b.id) - vol(a.id))
    .slice(0, 3);

  for (const leg of legs) {
    edges.add(`${focusId}>${leg.id}`);
    heads.add(leg.id);
    let cur = leg.id;
    while (true) {
      const k = children(tree, cur).slice().sort((a, b) => vol(b.id) - vol(a.id));
      if (!k.length) break;
      if (vol(k[0].id) <= 0) break;
      edges.add(`${cur}>${k[0].id}`);
      cur = k[0].id;
    }
  }
  return { edges, heads };
}

export type Positioned = { x: number; y: number };
export type Layout = {
  pos: Record<string, Positioned>;
  depth: Record<string, number>;
  width: number;
  height: number;
  leaves: number;
  maxD: number;
};

// Layout ad albero: DFS che assegna alle foglie colonne incrementali e ai nodi
// interni la media della prima e ultima foglia sotto di loro. Porta rtLayout.
export function layout(
  tree: ReteTree,
  rootId: string,
  opts: LayoutOpts = {},
): Layout {
  const { colGap, rowGap, margin } = { ...DEF, ...opts };
  const _x: Record<string, number> = {};
  const _d: Record<string, number> = {};
  let leaf = 0;
  let maxD = 0;

  const lay = (id: string, d: number) => {
    _d[id] = d;
    if (d > maxD) maxD = d;
    const kids = children(tree, id);
    if (!kids.length) {
      _x[id] = leaf++;
    } else {
      kids.forEach((k) => lay(k.id, d + 1));
      _x[id] = (_x[kids[0].id] + _x[kids[kids.length - 1].id]) / 2;
    }
  };
  lay(rootId, 0);

  const pos: Record<string, Positioned> = {};
  for (const id of Object.keys(_d)) {
    pos[id] = { x: margin + _x[id] * colGap, y: margin + _d[id] * rowGap };
  }
  const leaves = Math.max(1, leaf);
  return {
    pos,
    depth: _d,
    width: Math.max(340, (leaves - 1) * colGap + margin * 2),
    height: maxD * rowGap + margin * 2,
    leaves,
    maxD,
  };
}

// Raggio in funzione del volume sottoalbero (radice fissa più grande).
export function nodeRadius(
  tree: ReteTree,
  id: string,
  rootId: string,
  memo?: Record<string, number>,
): number {
  if (id === rootId) return 30;
  const v = subtreeScans(tree, id, memo);
  const t = Math.min(1, Math.sqrt(v) / Math.sqrt(VMAX));
  return 16 + (32 - 16) * t;
}

// Colore caldo per volume crescente (ramo oro → arancio → rosa).
export function nodeColor(
  tree: ReteTree,
  id: string,
  memo?: Record<string, number>,
): string {
  const v = subtreeScans(tree, id, memo);
  if (v >= 1200) return "#9B3B57";
  if (v >= 700) return "#C4687A";
  if (v >= 400) return "#D9683A";
  if (v >= 200) return "#E08A2E";
  if (v >= 80) return "#E0A94B";
  return "#C9A87C";
}

export type ReteLeg = { id: string; name: string; vol: number };
export type ReteStats = {
  scans: number; // proprie del nodo
  rete: number; // discendenti
  depth: number; // profondità della gamba
  legs: ReteLeg[]; // gambe dirette ordinate per volume
};

export function nodeStats(tree: ReteTree, id: string): ReteStats {
  const memo: Record<string, number> = {};
  const n = tree[id];
  const legs = children(tree, id)
    .map((c) => ({ id: c.id, name: c.name, vol: subtreeScans(tree, c.id, memo) }))
    .sort((a, b) => b.vol - a.vol);
  return {
    scans: n ? n.scans : 0,
    rete: subtreeSize(tree, id),
    depth: maxDepth(tree, id),
    legs,
  };
}

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}
