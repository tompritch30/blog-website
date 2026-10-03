// One gutter for every page: 16px on phones, the owner's tighter 8px from the sm breakpoint.
export default function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-2xl px-4 sm:px-2 ${className}`}>{children}</div>;
}
