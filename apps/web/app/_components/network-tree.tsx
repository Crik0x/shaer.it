"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  inFocus,
  initials,
  layout,
  litEdges,
  nodeColor,
  nodeRadius,
  nodeStats,
  subtreeScans,
  type ReteTree,
} from "@/lib/rete";
import styles from "./network-tree.module.css";

const ROOT = "c0";

// Gerarchia di campagne dimostrativa: un Progetto monitora più campagne
// (canali), ognuna ramificata in sotto-campagne (posizionamenti). I numeri sono
// scansioni; risalgono per ramo. Volumi diversi per una linea tracciata leggibile.
function seed(): ReteTree {
  const t: [string, string | null, string, number][] = [
    ["c0", null, "Progetto", 0],
    ["a", "c0", "Volantino", 40],
    ["b", "c0", "Instagram", 30],
    ["c", "c0", "Fiera", 20],
    ["d", "c0", "Email", 15],
    ["a1", "a", "Vetrina", 60],
    ["a2", "a", "Cassa", 35],
    ["b1", "b", "Storie", 90],
    ["b2", "b", "Post", 45],
    ["b3", "b", "Reels", 120],
    ["b4", "b", "Bio", 25],
    ["c1", "c", "Stand", 80],
    ["d1", "d", "Newsletter", 55],
    ["d2", "d", "Firma", 18],
  ];
  const tree: ReteTree = {};
  for (const [id, parentId, name, scans] of t) tree[id] = { id, parentId, name, scans };
  return tree;
}

const fmt = (n: number) => n.toLocaleString("it-IT");

type View = { tx: number; ty: number; s: number };
type Hover = { id: string; x: number; y: number };

export default function NetworkTree() {
  const [tree, setTree] = useState<ReteTree>(seed);
  const [focusId, setFocusId] = useState(ROOT);
  const [selId, setSelId] = useState<string | null>(null);
  const [view, setView] = useState<View>({ tx: 0, ty: 0, s: 1 });
  const [hover, setHover] = useState<Hover | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ on: boolean; x: number; y: number; tx: number; ty: number }>({
    on: false, x: 0, y: 0, tx: 0, ty: 0,
  });
  const seq = useRef(100);

  // Tutto il disegno deriva dal solo albero: layout, volumi, linea accesa.
  const draw = useMemo(() => {
    const memo: Record<string, number> = {};
    const lay = layout(tree, ROOT);
    const lit = litEdges(tree, focusId);
    return { memo, lay, lit };
  }, [tree, focusId]);

  // Centra la radice orizzontalmente al montaggio e quando cambia l'ampiezza.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const root = draw.lay.pos[ROOT];
    setView((v) => ({ ...v, tx: el.clientWidth / 2 - root.x }));
    // solo al mount: la larghezza dell'albero non cambia il centraggio voluto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectNode = useCallback((id: string) => {
    setSelId(id);
    setFocusId(id);
  }, []);

  const deselect = useCallback(() => {
    setSelId(null);
    setFocusId(ROOT);
  }, []);

  const addChild = useCallback((parentId: string) => {
    const id = "x" + seq.current++;
    setTree((prev) => ({
      ...prev,
      [id]: { id, parentId, name: "Sotto-campagna", scans: 8 + Math.floor(Math.random() * 34) },
    }));
    setSelId(id);
    setFocusId(parentId);
  }, []);

  const zoom = useCallback((f: number) => {
    setView((v) => ({ ...v, s: Math.min(2.2, Math.max(0.5, v.s * f)) }));
  }, []);

  // pan con pointer
  const onPointerDown = (e: React.PointerEvent) => {
    // solo sfondo: i nodi e il "+" gestiscono da sé
    if ((e.target as Element).closest("[data-node]")) return;
    drag.current = { on: true, x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    setGrabbing(true);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    setView((v) => ({
      ...v,
      tx: drag.current.tx + (e.clientX - drag.current.x),
      ty: drag.current.ty + (e.clientY - drag.current.y),
    }));
  };
  const endPan = () => {
    drag.current.on = false;
    setGrabbing(false);
  };

  const enterNode = (id: string, e: React.PointerEvent) => {
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHover({ id, x: rect.right + 12, y: rect.top });
    }, 280);
  };
  const leaveNode = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHover(null);
  };

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const { memo, lay, lit } = draw;
  const nodeList = Object.values(tree);
  const stats = hover ? nodeStats(tree, hover.id) : null;
  const maxLeg = stats && stats.legs.length ? Math.max(...stats.legs.map((l) => l.vol), 1) : 1;

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        className={`${styles.canvas}${grabbing ? " " + styles.grabbing : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerLeave={endPan}
        onClick={(e) => {
          if (!(e.target as Element).closest("[data-node]")) deselect();
        }}
      >
        <svg
          className={styles.svg}
          width={lay.width}
          height={lay.height}
          viewBox={`0 0 ${lay.width} ${lay.height}`}
          style={{ transform: `translate(${view.tx}px,${view.ty}px) scale(${view.s})`, transformOrigin: "0 0" }}
        >
          <g>
            {nodeList.map((n) => {
              if (!n.parentId) return null;
              const p = lay.pos[n.parentId];
              const c = lay.pos[n.id];
              const pr = nodeRadius(tree, n.parentId, ROOT, memo);
              const cr = nodeRadius(tree, n.id, ROOT, memo);
              const key = `${n.parentId}>${n.id}`;
              const view2 = inFocus(tree, n.id, focusId) && inFocus(tree, n.parentId, focusId);
              const cls = [
                styles.edge,
                lit.edges.has(key) ? styles.edgeLit : view2 ? styles.edgeActive : "",
                view2 ? "" : styles.dim,
              ].filter(Boolean).join(" ");
              const my = (p.y + c.y) / 2;
              const d = `M${p.x},${p.y + pr} C${p.x},${my} ${c.x},${my} ${c.x},${c.y - cr}`;
              return <path key={key} className={cls} d={d} />;
            })}
          </g>
          <g>
            {nodeList.map((n) => {
              const c = lay.pos[n.id];
              const r = nodeRadius(tree, n.id, ROOT, memo);
              const col = nodeColor(tree, n.id, memo);
              const vol = subtreeScans(tree, n.id, memo);
              const focused = inFocus(tree, n.id, focusId);
              const cls = [
                styles.node,
                selId === n.id ? styles.nodeSel : "",
                focused ? "" : styles.dim,
                lit.heads.has(n.id) ? styles.pulse : "",
              ].filter(Boolean).join(" ");
              const fs = Math.max(10, Math.round(r * 0.62));
              return (
                <g
                  key={n.id}
                  data-node={n.id}
                  className={cls}
                  transform={`translate(${c.x},${c.y})`}
                  onClick={(e) => { e.stopPropagation(); selectNode(n.id); }}
                  onPointerEnter={(e) => enterNode(n.id, e)}
                  onPointerLeave={leaveNode}
                >
                  <circle className={styles.circle} r={r.toFixed(1)} fill={col} />
                  <text className={styles.init} style={{ fontSize: fs }}>
                    {initials(n.name)}
                  </text>
                  <text className={styles.name} y={r + 14}>{n.name}</text>
                  {vol > 0 && <text className={styles.vol} y={r + 26}>{fmt(vol)}</text>}
                  <g
                    className={styles.plus}
                    transform={`translate(${r * 0.72},${r * 0.72})`}
                    onClick={(e) => { e.stopPropagation(); addChild(n.id); }}
                  >
                    <circle r="9" />
                    <line x1="-4" y1="0" x2="4" y2="0" />
                    <line x1="0" y1="-4" x2="0" y2="4" />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        <div className={styles.zoom}>
          <button type="button" className={styles.zoomBtn} onClick={() => zoom(1.2)} aria-label="Ingrandisci">+</button>
          <button type="button" className={styles.zoomBtn} onClick={() => zoom(0.83)} aria-label="Rimpicciolisci">−</button>
        </div>
        <div className={styles.hint}>Trascina per spostarti · clicca una campagna per il focus · «+» per aggiungere una sotto-campagna</div>
      </div>

      {hover && stats && (
        <div className={`${styles.pop} ${styles.popShow}`} style={{ left: hover.x, top: hover.y }}>
          <div className={styles.popNm}>{tree[hover.id]?.name}</div>
          <div className={styles.popMeta}>{stats.rete} sotto-campagne · {stats.depth} livelli</div>
          <div className={styles.popRow}><span>Scansioni dirette</span><b>{fmt(stats.scans)}</b></div>
          <div className={styles.popRow}><span>Scansioni totali</span><b>{fmt(subtreeScans(tree, hover.id))}</b></div>
          {stats.legs.length > 0 && <div className={styles.popDiv} />}
          {stats.legs.slice(0, 3).map((l) => (
            <div key={l.id} className={styles.popLeg}>
              <span className={styles.legName}>{l.name}</span>
              <span className={styles.legBar}>
                <span className={styles.legFill} style={{ width: `${Math.round((l.vol / maxLeg) * 100)}%` }} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
