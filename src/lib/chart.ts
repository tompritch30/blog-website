// Scales and ticks for the dependency-free SVG chart (src/components/mdx/Chart.tsx).
// The tick step follows d3-array's tickIncrement (ISC licence, after Heckbert's "nice numbers"):
// 1, 2 or 5 times a power of ten, whichever is nearest the raw step. Below a step of 1 the ticks are
// computed as i / (1 / step), so 0.2 * 3 prints as 0.6 and not 0.6000000000000001.

export type Ticks = { min: number; max: number; step: number; ticks: number[] };

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/** Round ends out to whole steps and list the ticks between them, about `count` of them. */
export function niceTicks(lo: number, hi: number, count = 5): Ticks {
  const a = Math.min(lo, hi);
  const b = lo === hi ? lo + 1 : Math.max(lo, hi);
  const raw = (b - a) / Math.max(1, count);
  const power = Math.floor(Math.log10(raw));
  const error = raw / 10 ** power;
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;
  // Below 1 the step is held as its inverse, a whole number, to keep the arithmetic exact.
  const inverse = power < 0 ? 10 ** -power / factor : 0;
  const step = inverse ? 1 / inverse : factor * 10 ** power;
  const at = (i: number) => (inverse ? i / inverse : i * step) || 0;
  const first = inverse ? Math.floor(a * inverse) : Math.floor(a / step);
  const last = inverse ? Math.ceil(b * inverse) : Math.ceil(b / step);
  const ticks: number[] = [];
  for (let i = first; i <= last; i++) ticks.push(at(i));
  return { min: at(first), max: at(last), step, ticks };
}

/** A linear map from a domain to a range; a one-point domain maps to the middle of the range. */
export function linear([d0, d1]: [number, number], [r0, r1]: [number, number]): (v: number) => number {
  if (d0 === d1) return () => (r0 + r1) / 2;
  return (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

/** Split a range into n equal bands: their width and centres (bars, and category axes). */
export function bands(n: number, start: number, end: number): { width: number; centres: number[] } {
  const width = (end - start) / n;
  return { width, centres: Array.from({ length: n }, (_, i) => start + width * (i + 0.5)) };
}

/** Decimals needed to write a step exactly (0.25 needs 2, 50 needs 0). */
function decimalsOf(step: number): number {
  const s = Number(step.toPrecision(12)).toString();
  const m = /\.(\d+)$/.exec(s) ?? /e-(\d+)$/.exec(s);
  return m ? (s.includes("e-") ? Number(m[1]) : m[1].length) : 0;
}

/** A tick label: the step's decimals on every tick, thousands grouped, a real minus sign, never -0. */
export function formatTick(value: number, step: number): string {
  const d = decimalsOf(step);
  const v = Math.abs(value) < 10 ** -(d + 1) ? 0 : value;
  return v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");
}

const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

/** An SVG path through the points, coordinates rounded to two decimals. */
export function linePath(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${round2(x)} ${round2(y)}`).join("");
}
