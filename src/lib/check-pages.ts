// Pure parts of scripts/check-pages.mts (axe, rendered controls, the nav and screenshots).
// The browser work lives in the script; what can be decided without a browser lives here and is tested.

export type PageRoute = { path: string; pattern: string; name: string };
export type Violation = { id: string; impact?: string | null };

/** Every page the check visits, with the route pattern CONTROLS.json keys it by and a screenshot name. */
export function pageRoutes(slugs: string[], missing: string): PageRoute[] {
  return [
    { path: "/", pattern: "/", name: "home" },
    { path: "/writing", pattern: "/writing", name: "writing" },
    ...slugs.map((s) => ({ path: `/writing/${s}`, pattern: "/writing/[slug]", name: `writing-${s}` })),
    { path: "/about", pattern: "/about", name: "about" },
    { path: missing, pattern: "/_not-found", name: "404" },
  ];
}

// The site is light only (owner decision, 4 Oct 2026); the name keeps "light" so older shots still match.
export const shotFile = (name: string, width: number) => `${name}-${width}-light.png`;

/** The violations that fail the check: serious or critical ones, and any colour-contrast one. */
export function blocking<V extends Violation>(violations: V[]): V[] {
  return violations.filter((v) => v.impact === "serious" || v.impact === "critical" || v.id.startsWith("color-contrast"));
}

// Where Playwright's cache keeps each build's binary on Linux, newest layout first.
const BINARIES: Record<string, string[]> = {
  chromium_headless_shell: ["chrome-headless-shell-linux64/chrome-headless-shell", "chrome-linux/headless_shell"],
  chromium: ["chrome-linux64/chrome", "chrome-linux/chrome"],
};

/** The browser to drive from a Playwright cache listing: the newest headless shell, else the newest Chromium. */
export function pickChromium(root: string, names: string[], exists: (p: string) => boolean): string | null {
  const builds = names
    .map((n) => /^(chromium_headless_shell|chromium)-(\d+)$/.exec(n))
    .filter((m): m is RegExpExecArray => !!m)
    .sort((a, b) => (a[1] === b[1] ? Number(b[2]) - Number(a[2]) : a[1] === "chromium_headless_shell" ? -1 : 1));
  for (const [name, kind] of builds) {
    for (const bin of BINARIES[kind]) {
      const p = `${root}/${name}/${bin}`;
      if (exists(p)) return p;
    }
  }
  return null;
}
