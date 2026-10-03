import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";
import "./globals.css";

// Newsreader (SIL OFL 1.1) for headings, the name, figures and the one italic line: variable in
// weight and optical size, so a 64px headline and a 19px case-study title are each drawn for their size.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});
// IBM Plex Sans (SIL OFL 1.1) for reading text, nav and meta lines; Plex Mono for code in posts.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  alternates: baseAlternates,
  openGraph: { ...baseOpenGraph, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only bg-surface px-3 py-2 text-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60]"
        >
          Skip to content
        </a>
        <Nav name={site.name} github={site.github} />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
