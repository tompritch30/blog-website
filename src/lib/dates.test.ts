import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatDate, formatShortDate, yearSpan } from "./dates";

describe("formatDate", () => {
  const originalTz = process.env.TZ;
  // A server west of UTC used to render the day before the date in the frontmatter.
  beforeAll(() => {
    process.env.TZ = "America/New_York";
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("shows the calendar date written in the frontmatter, whatever the server's time zone", () => {
    expect(formatDate("2026-03-30")).toBe("30 March 2026");
    expect(formatDate("2026-01-01")).toBe("1 January 2026");
  });

  it("has a short form for the date column, also in UTC", () => {
    expect(formatShortDate("2026-03-30")).toBe("30 Mar 2026");
    expect(formatShortDate("2026-01-01")).toBe("1 Jan 2026");
  });
});

describe("yearSpan", () => {
  // The home page's date column shows years only; the CV keeps the months.
  it("keeps an open range open", () => {
    expect(yearSpan("Apr 2026 – Present")).toBe("2026–");
  });

  it("joins the first and last years of a closed range with an en dash", () => {
    expect(yearSpan("Oct 2024 – Apr 2026")).toBe("2024–2026");
  });

  it("collapses a range inside one year to that year", () => {
    expect(yearSpan("May 2023 – Sep 2023")).toBe("2023");
  });

  it("passes a lone year through", () => {
    expect(yearSpan("2021")).toBe("2021");
  });
});
