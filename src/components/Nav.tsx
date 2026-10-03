"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ExternalLink from "@/components/ExternalLink";
import { WRITING_PATH } from "@/lib/paths";

const PAGES = [
  { href: WRITING_PATH, label: "Writing" },
  { href: "/cv", label: "CV" },
  { href: "/about", label: "About" },
];

// The name on the left, a few text links on the right; the current section in the accent colour
// with a rule under it (a post counts as Writing). Client component for aria-current, so the server
// layout passes the site fields in. Not sticky: the home page has its own section bar.
export default function Nav({ name, github }: { name: string; github: string }) {
  const pathname = usePathname();
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="page">
      <nav aria-label="Main" className="site-head">
        <Link href="/" className="site-name">
          {name}
        </Link>
        <ul className="site-links">
          {PAGES.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} aria-current={current(href) ? "page" : undefined}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <ExternalLink href={github} className="">
              GitHub
            </ExternalLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
