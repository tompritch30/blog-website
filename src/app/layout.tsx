import type { Metadata } from "next";
import { Geist_Mono, Literata } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";
import "./globals.css";

// Literata (SIL Open Font License 1.1), variable in weight and optical size, so the headline and
// the 13px date column are each drawn for their size. Self-hosted by next/font at build time.
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});
// Geist Mono (SIL OFL 1.1) for code in posts only.
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="en-GB" className={`${literata.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-sm bg-surface px-3 py-2 text-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60]"
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
