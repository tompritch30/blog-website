export default function Footer() {
  return (
    <footer
      className="mt-auto py-10"
      style={{ borderTop: "1px solid var(--divider)" }}
    >
      <div
        className="max-w-2xl mx-auto px-1 sm:px-2 flex items-center justify-between text-xs"
        style={{ color: "var(--muted)" }}
      >
        <span>© {new Date().getFullYear()} Tom</span>{/* TODO: your name */}
        <span>Built with Next.js + MDX</span>
      </div>
    </footer>
  );
}
