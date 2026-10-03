"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";
import { WRITING_PATH } from "@/lib/paths";

const PAGES = [
  { href: WRITING_PATH, label: "Writing" },
  { href: "/about", label: "About" },
];

// Client component (for aria-current), so the server layout passes the site fields in
// rather than this importing the server-side site config.
export default function Nav({ name, github }: { name: string; github: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-divider bg-bg">
      <Container>
        <nav aria-label="Main" className="flex h-12 items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-fg">
            {name}
          </Link>
          <ul className="flex items-center gap-5 text-sm text-secondary">
            {PAGES.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className="hover:text-fg aria-[current=page]:text-fg"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a href={github} className="hover:text-fg">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
