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
