// Every off-site link opens in a new tab and says so: a visible arrow (a text glyph, hidden from
// screen readers) and a visually hidden "(opens in a new tab)" that screen readers do announce.
export default function ExternalLink({
  href,
  children,
  className = "link",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="ext" aria-hidden="true">
        {"↗"}
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
