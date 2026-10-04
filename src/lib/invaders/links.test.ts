import { describe, expect, it } from "vitest";
import { MYSTERY_TARGETS, followTarget, isInternal, mysteryTarget } from "./links";

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

describe("isInternal", () => {
  it("is true for a path on this site and false for another site, protocol-relative ones included", () => {
    expect(["/cv", "/writing/a-post", "https://github.com/x", "http://example.org", "//example.org/cv"].map(isInternal)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ]);
  });
});

// A stand-in browser that records what the game asked of it.
function browser(tab: { opener: unknown } | null) {
  const calls: string[] = [];
  return {
    calls,
    env: {
      open: (url: string, target: string) => {
        calls.push(`open ${url} ${target}`);
        return tab;
      },
      go: (href: string) => {
        calls.push(`go ${href}`);
      },
    },
  };
}

describe("followTarget", () => {
  it("goes to a page on this site in the same tab, opening no new tab", () => {
    const b = browser({ opener: {} });
    expect(followTarget(b.env, "/cv")).toBe("same-tab");
    expect(b.calls).toEqual(["go /cv"]);
  });

  it("opens another site in a new tab, cuts the new tab's link back to this page, and reports it", () => {
    const tab = { opener: {} as unknown };
    const b = browser(tab);
    expect(followTarget(b.env, "https://example.org/x")).toBe("new-tab");
    expect(b.calls).toEqual(["open https://example.org/x _blank"]);
    expect(tab.opener).toBeNull();
  });

  it("reports a blocked popup when the browser returns null for another site", () => {
    const b = browser(null);
    expect(followTarget(b.env, "https://github.com/tompritch30")).toBe("blocked");
    expect(b.calls).toEqual(["open https://github.com/tompritch30 _blank"]);
  });

  it("treats a protocol-relative address as another site", () => {
    const b = browser({ opener: {} });
    expect(followTarget(b.env, "//example.org/cv")).toBe("new-tab");
    expect(b.calls).toEqual(["open //example.org/cv _blank"]);
  });
});
