import { describe, expect, it } from "vitest";
import { MYSTERY_TARGETS, mysteryTarget, openTarget } from "./links";

describe("mystery ship link targets", () => {
  it("are the paper, the CV and GitHub, each with a sentence-case link text", () => {
    expect(MYSTERY_TARGETS.map((t) => [t.href, t.linkText])).toEqual([
      ["https://doi.org/10.1109/lra.2025.3557738", "Open the paper"],
      ["/cv", "Open my CV"],
      ["https://github.com/tompritch30", "Open my GitHub"],
    ]);
  });

  it("rotate: the nth hit opens target n, wrapping round", () => {
    expect([0, 1, 2, 3, 4].map((n) => mysteryTarget(n).linkText)).toEqual([
      "Open the paper",
      "Open my CV",
      "Open my GitHub",
      "Open the paper",
      "Open my CV",
    ]);
  });
});

describe("openTarget", () => {
  it("opens the link in a new tab, cuts the new tab's link back to this page, and reports success", () => {
    const tab = { opener: {} as unknown };
    const calls: unknown[][] = [];
    const ok = openTarget((...args) => {
      calls.push(args);
      return tab;
    }, "https://example.org/x");
    expect(ok).toBe(true);
    expect(calls).toEqual([["https://example.org/x", "_blank"]]);
    expect(tab.opener).toBeNull();
  });

  it("reports a blocked popup when the browser returns null", () => {
    expect(openTarget(() => null, "/cv")).toBe(false);
  });
});
