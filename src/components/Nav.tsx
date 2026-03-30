import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "https://github.com/yourusername", label: "GitHub", external: true },
];

export default function Nav() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--divider)",
        background: "var(--bg)",
      }}
      className="sticky top-0 z-50 backdrop-blur-sm"
    >
      <nav className="max-w-2xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {/* TODO: replace with your name */}
          Tom
        </Link>
        <ul className="flex items-center gap-5">
          {links.map(({ href, label, external }) => (
            <li key={href}>
              <Link
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="text-sm transition-opacity hover:opacity-60"
                style={{ color: "var(--secondary)" }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
