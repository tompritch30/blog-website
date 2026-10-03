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

// Client component (for aria-current), so the server layout passes the site fields in
// rather than this importing the server-side site config. Not sticky: the page is a document.
export default function Nav({ name, github }: { name: string; github: string }) {
  const pathname = usePathname();
  return (
    <header className="page">
      <nav aria-label="Main" className="masthead">
        <Link href="/" className="masthead-name">
          {name}
        </Link>
        <ul className="masthead-links">
          {PAGES.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
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
