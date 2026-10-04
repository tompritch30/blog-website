// The frame for the inner pages: the page's gutters at the same width as the header.
export default function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`page ${className}`}>{children}</div>;
}
