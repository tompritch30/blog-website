"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";
import { site } from "@/lib/site";

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-divider bg-bg">
      <Container>
        <nav aria-label="Main" className="flex h-12 items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-fg">
            {site.name}
          </Link>
          <ul className="flex items-center gap-5 text-sm text-secondary">
            <li>
              <Link
                href="/about"
                aria-current={pathname === "/about" ? "page" : undefined}
                className="hover:text-fg aria-[current=page]:text-fg"
              >
                About
              </Link>
            </li>
            <li>
              <a href={site.github} className="hover:text-fg">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
