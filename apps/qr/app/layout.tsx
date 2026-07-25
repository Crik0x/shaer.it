import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Geist_Mono } from "next/font/google";
import "./globals.css";

// Estetica luxury Arkés: display serif Cormorant, testo sans Jost (T-011).
// Cormorant non è variabile → i pesi vanno dichiarati; Jost è variabile.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shaer.it — QR dinamici",
  description: "Crea, gestisci e traccia QR code dinamici.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${jost.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
