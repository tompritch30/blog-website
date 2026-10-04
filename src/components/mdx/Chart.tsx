import { useId } from "react";
import { bands, formatTick, linePath, linear, niceTicks } from "@/lib/chart";

// A small line or bar chart for posts, with no chart library and no client JavaScript.
// The plot is an SVG stretched over its box (preserveAspectRatio="none", strokes kept at their
// width by vector-effect), and every label is HTML placed by percentage, so text stays the page's
// own size and face at 375px and at 1440px. Colours come only from CSS custom properties: the
// design's --chart-1.. tokens when it defines them, else the text and secondary tokens, so the
// palette styles it. Assistive tech gets one image (title and description) plus a hidden data table.

type Series = { name: string; values: number[] };

type Props = {
  type: "line" | "bar";
  title: string;
  /** What the chart shows, in a sentence or two, for screen readers. */
  description: string;
  x: (number | string)[];
  series: Series[];
  xLabel: string;
  yLabel: string;
  /** Appended to y values in tick labels and the table, such as "%". */
  unit?: string;
  /** A horizontal line to read the data against, such as break-even. */
  reference?: { value: number; label: string };
};

const COLOURS = ["var(--chart-1, var(--text))", "var(--chart-2, var(--secondary))", "var(--chart-3, var(--text))", "var(--chart-4, var(--secondary))"];
// Series differ by dash as well as colour, so the chart reads in print and without colour vision.
const DASHES = [undefined, "6 4", "2 3", "10 3 2 3"];
const GRID = "var(--chart-grid, var(--divider))";
const AXIS = "var(--chart-axis, var(--secondary))";

const value = (v: number, unit = "") => `${v.toLocaleString("en-GB", { maximumFractionDigits: 6 })}${unit}`;
const edge = (pct: number) => (pct >= 95 ? "-translate-x-full" : pct <= 5 ? "" : "-translate-x-1/2");

export default function Chart({ type, title, description, x, series, xLabel, yLabel, unit = "", reference }: Props) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  const all = series.flatMap((s) => s.values).concat(reference ? [reference.value] : []);
  // Bars always start from zero; lines too, since every chart here is about how far from zero.
  const y = niceTicks(Math.min(0, ...all), Math.max(0, ...all), 5);
  const toY = linear([y.min, y.max], [100, 0]);

  const numericX = type === "line" && x.every((v) => typeof v === "number");
  const xs = x as number[];
  const xTicks = numericX ? niceTicks(Math.min(...xs), Math.max(...xs), 5) : null;
  const band = bands(x.length, 0, 100);
  const toX = numericX ? linear([xTicks!.min, xTicks!.max], [0, 100]) : (_: number | string, i: number) => band.centres[i];
  const xLabels = numericX
    ? xTicks!.ticks.map((t) => ({ at: toX(t, 0), text: formatTick(t, xTicks!.step) }))
    : x.map((v, i) => ({ at: band.centres[i], text: String(v) }));

  const groupWidth = band.width * 0.7;
  const barWidth = groupWidth / Math.max(1, series.length);

  return (
    <div className="not-prose my-8">
      <p id={titleId} className="mb-1 text-sm font-semibold text-fg">
        {title}
      </p>
      <p id={descId} className="sr-only">
        {description}
      </p>
      <div role="img" aria-labelledby={titleId} aria-describedby={descId}>
        {series.length > 1 && (
          <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-secondary">
            {series.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <svg width="24" height="8" viewBox="0 0 24 8" aria-hidden="true">
                  {type === "line" ? (
                    <line x1="0" x2="24" y1="4" y2="4" strokeWidth="2" strokeDasharray={DASHES[i % DASHES.length]} style={{ stroke: COLOURS[i % COLOURS.length] }} />
                  ) : (
                    <rect x="6" y="0" width="12" height="8" style={{ fill: COLOURS[i % COLOURS.length] }} />
                  )}
                </svg>
                {s.name}
              </li>
            ))}
          </ul>
        )}
        <p className="mb-2 text-xs text-secondary">{yLabel}</p>
        <div className="flex">
          <div className="relative w-12 shrink-0 text-xs text-secondary">
            {y.ticks.map((t) => (
              <span key={t} className="absolute right-2 -translate-y-1/2 leading-none" style={{ top: `${toY(t)}%` }}>
                {formatTick(t, y.step)}
                {unit}
              </span>
            ))}
          </div>
          <div className="relative aspect-[4/3] grow sm:aspect-[16/9]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              {y.ticks.map((t) => (
                <line key={t} x1="0" x2="100" y1={toY(t)} y2={toY(t)} strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ stroke: t === 0 ? AXIS : GRID }} />
              ))}
              {reference && (
                <line x1="0" x2="100" y1={toY(reference.value)} y2={toY(reference.value)} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" style={{ stroke: AXIS }} />
              )}
              {type === "line"
                ? series.map((s, i) => (
                    <path
                      key={s.name}
                      data-series={i}
                      d={linePath(s.values.map((v, j) => [toX(x[j] as number, j), toY(v)]))}
                      fill="none"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray={DASHES[i % DASHES.length]}
                      vectorEffect="non-scaling-stroke"
                      style={{ stroke: COLOURS[i % COLOURS.length] }}
                    />
                  ))
                : series.flatMap((s, i) =>
                    s.values.map((v, j) => {
                      const left = band.centres[j] - groupWidth / 2 + i * barWidth;
                      const top = Math.min(toY(v), toY(0));
                      return (
                        <rect key={`${s.name}-${j}`} data-series={i} x={left} y={top} width={barWidth} height={Math.abs(toY(0) - toY(v))} style={{ fill: COLOURS[i % COLOURS.length] }} />
                      );
                    }),
                  )}
            </svg>
            {reference && (
              <span className="absolute right-0 -translate-y-full pb-0.5 text-xs leading-none text-secondary" style={{ top: `${toY(reference.value)}%` }}>
                {reference.label}
              </span>
            )}
          </div>
        </div>
        <div className="relative ml-12 h-6 text-xs text-secondary">
          {xLabels.map((l) => (
            <span key={`${l.at}-${l.text}`} className={`absolute top-1.5 whitespace-nowrap leading-none ${edge(l.at)}`} style={{ left: `${l.at}%` }}>
              {l.text}
            </span>
          ))}
        </div>
        <p className="ml-12 mt-1 text-center text-xs text-secondary">{xLabel}</p>
      </div>
      {/* overflow-hidden! beats globals.css's `.prose table { overflow-x: auto }`, which otherwise
          turns this hidden table into a scroll region axe asks keyboard access for. */}
      <table className="sr-only overflow-hidden!">
        <caption>{`Data for the chart: ${title}`}</caption>
        <thead>
          <tr>
            <th scope="col">{xLabel}</th>
            {series.map((s) => (
              <th key={s.name} scope="col">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {x.map((v, j) => (
            <tr key={`${j}-${String(v)}`}>
              <th scope="row">{typeof v === "number" ? value(v) : v}</th>
              {series.map((s) => (
                <td key={s.name}>{value(s.values[j], unit)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
