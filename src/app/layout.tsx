import type { Metadata } from "next";
import "./globals.css";
import { motionInit } from "@/lib/motionBootstrap";

export const metadata: Metadata = {
  title: "Maggie's Trail — Visual K–12 math you can touch",
  manifest: "/manifest.webmanifest",
  referrer: "no-referrer",
  description:
    "An interactive learning trail for K–12 math: from counting and fractions through algebra, geometry, and precalculus — learned by doing.",
  // Production origin (see WAVE04_BASELINE.md / HANDOVER_COWORK_S2xx docs), needed to resolve
  // the relative `icons` path below into an absolute URL. No openGraph/twitter yet — there is
  // no OG image asset in this pass, and metadata must never reference a missing file.
  metadataBase: new URL("https://maggies-trail.vercel.app"),
  icons: {
    icon: "/brand/maggies-mark.svg"
  }
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
