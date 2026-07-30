"use client";

import dynamic from "next/dynamic";

// Il designer (canvas + qrcode + controlli) è pesante e va solo lato client:
// entra con dynamic import (ssr: false), così non pesa sul bundle server né
// sul primo render (regola d'oro 9).
const QrDesigner = dynamic(() => import("./qr-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl border border-border">
      <span className="text-sm text-muted-foreground">Carico il designer…</span>
    </div>
  ),
});

export function QrPanel({
  content,
  filename,
}: {
  content: string;
  filename: string;
}) {
  return <QrDesigner content={content} filename={filename} />;
}
