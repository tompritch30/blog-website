// Post dates are calendar dates ("2026-03-30"). Parsing gives UTC midnight, so format in UTC
// too; otherwise a server or reader west of UTC sees the day before.
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "30 Mar 2026": the narrow date column on the home page. */
export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const EN_DASH = "–";

/** The years of a CV date range: "Oct 2024 – Apr 2026" is "2024–2026", "Apr 2026 – Present" is "2026–". */
export function yearSpan(dates: string): string {
  const years = dates.match(/\d{4}/g) ?? [];
  if (years.length === 0) return dates;
  const first = years[0];
  const last = years[years.length - 1];
  if (/present/i.test(dates)) return `${first}${EN_DASH}`;
  return first === last ? first : `${first}${EN_DASH}${last}`;
}
