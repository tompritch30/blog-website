// Where a hit on the mystery ship takes the visitor. Pure apart from the open function the
// caller passes in, so the rotation and the popup handling are tested without a browser.
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

type Opened = { opener: unknown } | null;

/**
 * Opens href in a new tab. Returns false when the browser blocked the popup.
 * Not "noopener" in the features: with it, window.open returns null even on success, so a
 * blocked popup could not be told apart. The opener is cut by hand instead.
 */
export function openTarget(open: (url: string, target: string) => Opened, href: string): boolean {
  const tab = open(href, "_blank");
  if (!tab) return false;
  try {
    tab.opener = null;
  } catch {
    // a cross-origin tab may refuse; it has already loaded with no reason to call back
  }
  return true;
}
