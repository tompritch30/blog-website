import type { Education, Elsewhere } from "@/content/profile";

// The web CV's lines, set the way his printed CV sets them (the /cv page; owner review, 4 Oct 2026).

/** A profile address as a printed CV shows it: no scheme, no "www.", no trailing slash. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
}

/** One education line: the institution (set bold), then the credential and any note after it. */
export function educationLine(degree: Education): { institution: string; rest: string } {
  return { institution: degree.institution, rest: degree.note ? `${degree.credential}, ${degree.note}` : degree.credential };
}

/** Outside work as one line of short sentences: "head, note." for each item. */
export function elsewhereLine(items: Elsewhere[]): string {
  return items.map(({ head, note }) => (note ? `${head}, ${note}.` : `${head}.`)).join(" ");
}
