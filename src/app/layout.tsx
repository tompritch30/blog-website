import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
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
    <html lang="en-GB" className={`${inter.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only rounded-sm bg-surface px-3 py-2 text-sm text-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60]"
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
