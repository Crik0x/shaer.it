"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";

// Foglia pesante caricata via dynamic import (vedi qr-panel). Rende il QR
// dell'indirizzo immutabile con colori e logo, e permette il download PNG/SVG.
export default function QrCanvas({
  content,
  filename,
}: {
  content: string;
  filename: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(320);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    QRCode.toCanvas(canvas, content, {
      width: size,
      margin: 2,
      // Con un logo al centro serve correzione alta per restare leggibile.
      errorCorrectionLevel: logo ? "H" : "M",
      color: { dark: fg, light: bg },
    })
      .then(() => {
        if (cancelled || !logo) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          const s = size * 0.22;
          const pos = (size - s) / 2;
          const pad = 4;
          ctx.fillStyle = bg;
          ctx.fillRect(pos - pad, pos - pad, s + pad * 2, s + pad * 2);
          ctx.drawImage(img, pos, pos, s, s);
        };
        img.src = logo;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [content, fg, bg, size, logo]);

  function onLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setLogo(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${filename}.png`;
    a.click();
  }

  async function downloadSvg() {
    // SVG a colori; il logo resta solo nel PNG (non incorporato nell'SVG).
    const svg = await QRCode.toString(content, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: logo ? "H" : "M",
      color: { dark: fg, light: bg },
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
      <div className="flex items-start justify-center rounded-xl border border-border bg-card p-4">
        <canvas
          ref={canvasRef}
          data-testid="qr-canvas"
          className="h-auto max-w-full rounded"
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            Colore
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="block h-9 w-full cursor-pointer rounded-lg border border-input bg-background"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            Sfondo
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="block h-9 w-full cursor-pointer rounded-lg border border-input bg-background"
            />
          </label>
        </div>

        <label className="block space-y-1.5 text-sm font-medium text-foreground">
          Dimensione: {size}px
          <input
            type="range"
            min={160}
            max={640}
            step={16}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="block w-full"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-foreground">
          Logo al centro <span className="text-muted-foreground">(solo PNG)</span>
          <input
            type="file"
            accept="image/*"
            onChange={onLogo}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="button" size="lg" onClick={downloadPng}>
            Scarica PNG
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={downloadSvg}
          >
            Scarica SVG
          </Button>
        </div>
      </div>
    </div>
  );
}
