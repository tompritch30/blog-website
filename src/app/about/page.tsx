import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Container from "@/components/Container";
import Mdx from "@/components/Mdx";
import { baseAlternates } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}.`,
  alternates: { ...baseAlternates, canonical: "/about" },
};

export default function AboutPage() {
  const source = fs.readFileSync(path.join(process.cwd(), "src/content/about.mdx"), "utf-8");
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="mb-10 text-xl font-semibold tracking-tight text-fg">About</h1>
      <Mdx source={source} />
    </Container>
  );
}
