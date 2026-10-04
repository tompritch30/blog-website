// Where a hit on the mystery ship takes the visitor. Pure apart from the browser functions the
// caller passes in, so the rotation and the tab handling are tested without a browser.
export type MysteryTarget = { href: string; label: string; linkText: string };

export const MYSTERY_TARGETS: MysteryTarget[] = [
  { href: "https://doi.org/10.1109/lra.2025.3557738", label: "the ForestVO paper", linkText: "Open the paper" },
  { href: "/cv", label: "my CV", linkText: "Open my CV" },
  { href: "https://github.com/tompritch30", label: "my GitHub", linkText: "Open my GitHub" },
];

/** The target for the nth mystery hit (0-based), in rotation. */
export function mysteryTarget(n: number): MysteryTarget {
  const len = MYSTERY_TARGETS.length;
  return MYSTERY_TARGETS[((n % len) + len) % len];
}

/** A path on this site. "//host/path" is another site, whatever it looks like. */
export const isInternal = (href: string): boolean => href.startsWith("/") && !href.startsWith("//");

type Opened = { opener: unknown } | null;

export type Browser = {
  /** window.open */
  open: (url: string, target: string) => Opened;
  /** Leaves the game and loads href in this tab. */
  go: (href: string) => void;
};

export type Outcome = "same-tab" | "new-tab" | "blocked";

/**
 * The site's link rule: its own pages open in the same tab, other sites in a new one. "blocked"
 * means the browser refused the new tab.
 * Not "noopener" in the window.open features: with it, window.open returns null even on success,
 * so a blocked popup could not be told apart. The opener is cut by hand instead.
 */
export function followTarget(browser: Browser, href: string): Outcome {
  if (isInternal(href)) {
    browser.go(href);
    return "same-tab";
  }
  const tab = browser.open(href, "_blank");
  if (!tab) return "blocked";
  try {
    tab.opener = null;
  } catch {
    // a cross-origin tab may refuse; it has already loaded with no reason to call back
  }
  return "new-tab";
}
