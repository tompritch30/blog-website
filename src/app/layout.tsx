import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // TODO: update with your name and site description
  title: {
    default: "Tom — Software Engineer",
    template: "%s | Tom",
  },
  description:
    "Writing about software, tooling, and building things that automate the boring stuff.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    // TODO: update with your domain once deployed
    url: "https://yourdomain.com",
    siteName: "Tom",
  },
  twitter: {
    card: "summary",
    // TODO: your twitter handle
    // creator: "@yourhandle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
