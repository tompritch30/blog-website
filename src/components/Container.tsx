// The frame for the plainer pages: the page's gutters, with the text set in the ledger's
// particulars column so it lines up with the home page and the masthead.
export default function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="page">
      <div className={`plain ${className}`}>{children}</div>
    </div>
  );
}
