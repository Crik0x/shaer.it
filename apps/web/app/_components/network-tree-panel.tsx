"use client";

import dynamic from "next/dynamic";

// L'albero rete è pesante e interattivo (SVG + pointer): entra con dynamic
// import, no SSR (regola 9). Skeleton della stessa altezza per non far saltare
// il layout.
const NetworkTree = dynamic(() => import("./network-tree"), {
  ssr: false,
  loading: () => (
    <div className="h-[min(64vh,560px)] rounded-2xl border border-border bg-muted/40" />
  ),
});

export function NetworkTreePanel() {
  return <NetworkTree />;
}
