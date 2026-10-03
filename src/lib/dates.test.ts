import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatDate } from "./dates";

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
});
