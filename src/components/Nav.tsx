"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AlienTrigger from "@/components/invaders/AlienTrigger";
import { WRITING_PATH } from "@/lib/paths";

const WRITING = { href: WRITING_PATH, label: "Writing" };
const ABOUT = { href: "/about", label: "About" };

// The name on the left, the site's pages on the right and, next to About, the pixel alien that opens
// the arcade (the Konami code works on every page through this one). The current section is in the
// accent colour with a rule under it (a post counts as Writing). Writing shows only once a post is
// published (`showWriting`, from writingIsLive in the layout); until then nothing links to /writing. GitHub and LinkedIn are not here: each
// page that needs them links them once (the home hero, the end of About). Client
// component for aria-current. Not sticky.
export default function Nav({ name, showWriting }: { name: string; showWriting: boolean }) {
  const pathname = usePathname();
  const pages = showWriting ? [WRITING, ABOUT] : [ABOUT];
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="page">
      <nav aria-label="Main" className="site-head">
        <Link href="/" className="site-name">
          {name}
        </Link>
        <ul className="site-links">
          {pages.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} aria-current={current(href) ? "page" : undefined}>
                {label}
              </Link>
            </li>
          ))}
          <li className="site-alien">
            <AlienTrigger konami />
          </li>
        </ul>
      </nav>
    </header>
  );
}
