import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/Container";
import Mdx from "@/components/Mdx";
import { portrait } from "@/content/profile";
import { baseAlternates } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}.`,
  alternates: { ...baseAlternates, canonical: "/about" },
};

// The long version of the home page's About section: the text in the reading column, the photo
// beside it on wide screens and above it on phones.
export default function AboutPage() {
  const source = fs.readFileSync(path.join(process.cwd(), "src/content/about.mdx"), "utf-8");
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">About</h1>
      </div>
      <div className="about-page">
        <Mdx source={source} />
        <div className="about-portrait">
          <div className="portrait">
            <Image src={portrait.src} width={portrait.width} height={portrait.height} alt={portrait.alt} sizes="(min-width: 64rem) 13rem, 8rem" />
          </div>
        </div>
      </div>
    </Container>
  );
}
