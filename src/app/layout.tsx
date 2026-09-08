import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "shhh.baby — pay to keep the internet's baby asleep",
  description:
    "A very real baby runs on money. Every $1 buys exactly 1 minute of sleep. When the meter hits zero, it screams. Top bidders own the sponsor spotlight.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070b1f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
