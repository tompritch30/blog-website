import { formatDate } from "@/lib/dates";

// The colophon: the face the page is set in and the day the design was last revised.
const REVISED = "2026-10-03";

export default function Footer() {
  return (
    <footer className="page">
      <div className="row colophon">
        <p className="c-main">
          Set in Literata. Revised <time dateTime={REVISED}>{formatDate(REVISED)}</time>.{" "}
          <a href="/feed.xml">RSS feed</a>
        </p>
        {/* Room for the pixel alien button (merged later). */}
        <div className="colophon-slot" />
      </div>
    </footer>
  );
}
