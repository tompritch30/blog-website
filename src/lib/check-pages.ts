// Pure parts of scripts/check-pages.mts (axe, rendered controls, screenshots and the /cv print check).
// The browser work lives in the script; what can be decided without a browser lives here and is tested.

export type PageRoute = { path: string; pattern: string; name: string };
export type Violation = { id: string; impact?: string | null };
export type Rgba = { r: number; g: number; b: number; a: number };

/** Every page the check visits, with the route pattern CONTROLS.json keys it by and a screenshot name. */
export function pageRoutes(slugs: string[], missing: string): PageRoute[] {
  return [
    { path: "/", pattern: "/", name: "home" },
    { path: "/cv", pattern: "/cv", name: "cv" },
    { path: "/writing", pattern: "/writing", name: "writing" },
    ...slugs.map((s) => ({ path: `/writing/${s}`, pattern: "/writing/[slug]", name: `writing-${s}` })),
    { path: "/about", pattern: "/about", name: "about" },
    { path: missing, pattern: "/_not-found", name: "404" },
  ];
}

export const shotFile = (name: string, width: number, theme: string) => `${name}-${width}-${theme}.png`;

/** The violations that fail the check: serious or critical ones, and any colour-contrast one. */
export function blocking<V extends Violation>(violations: V[]): V[] {
  return violations.filter((v) => v.impact === "serious" || v.impact === "critical" || v.id.startsWith("color-contrast"));
}

/** A computed colour as Chromium serialises it, rgb() or rgba(); anything else is null. */
export function parseRgb(css: string): Rgba | null {
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/.exec(css.trim());
  if (!m) return null;
  const a = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a };
}

function luminance({ r, g, b }: Rgba): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Text colour over its background, alpha blended, as WCAG measures it. */
function resolve(fg: string, bg: string): [Rgba, Rgba] | null {
  const f = parseRgb(fg);
  const b = parseRgb(bg);
  if (!f || !b) return null;
  const mix = (x: number, y: number) => x * f.a + y * (1 - f.a);
  return [{ r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b), a: 1 }, b];
}

/** WCAG contrast ratio of a text colour on a background (0 when either is unreadable). */
export function contrastRatio(fg: string, bg: string): number {
  const pair = resolve(fg, bg);
  if (!pair) return 0;
  const [hi, lo] = pair.map(luminance).sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Printed text must be darker than its paper and meet WCAG AA (4.5:1). */
export function isDarkOnLight(fg: string, bg: string): boolean {
  const pair = resolve(fg, bg);
  return !!pair && luminance(pair[0]) < luminance(pair[1]) && contrastRatio(fg, bg) >= 4.5;
}

/** Pages in a PDF: page objects (/Type /Page), not the page tree (/Type /Pages). */
export function pdfPageCount(pdf: Buffer): number {
  return pdf.toString("latin1").match(/\/Type\s*\/Page(?![A-Za-z])/g)?.length ?? 0;
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
