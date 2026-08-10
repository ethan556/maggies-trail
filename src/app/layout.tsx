import type { Metadata } from "next";
import "./globals.css";
import { motionInit } from "@/lib/motionBootstrap";

export const metadata: Metadata = {
  title: "Maggie's Trail — Visual K–12 math you can touch",
  manifest: "/manifest.webmanifest",
  referrer: "no-referrer",
  description:
    "An interactive learning trail for K–12 math: from counting and fractions through algebra, geometry, and precalculus — learned by doing."
};

/** Applies the saved theme before first paint (no flash). */
const themeInit = `(function(){try{var t=localStorage.getItem("numera:theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: motionInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
