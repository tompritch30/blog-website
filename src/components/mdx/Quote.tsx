import type { ReactNode } from "react";
import { formatDate } from "@/lib/dates";

// A post on X quoted as plain HTML: the words, who wrote them and when, and a link to the original.
// No embed script, no tracking and no avatar, so the page loads nothing from X.
// The words are someone else's, quoted verbatim, so the blockquote carries data-verbatim and the
// slop lint (src/lib/slop.ts) leaves its text as written; the caption is ours and is checked.

type Props = { author: string; handle: string; date: string; href: string; children: ReactNode };

export default function Quote({ author, handle, date, href, children }: Props) {
  return (
    <figure className="quote">
      <blockquote cite={href} data-verbatim="quote">
        {children}
      </blockquote>
      <figcaption>
        {author} <span>@{handle}</span>,{" "}
        <a href={href} target="_blank" rel="noopener noreferrer">
          <time dateTime={date}>{formatDate(date)}</time> on X
          <span className="ext" aria-hidden="true">
            {"↗"}
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
  );
}
