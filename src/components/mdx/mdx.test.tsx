import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Chart from "./Chart";
import Figure from "./Figure";
import Pre from "./Pre";
import Quote from "./Quote";
import Table from "./Table";

const attr = (html: string, tag: string, name: string): string | undefined =>
  new RegExp(`<${tag}\\b[^>]*\\s${name}="([^"]*)"`).exec(html)?.[1];
const textOfId = (html: string, id: string): string | undefined =>
  new RegExp(`id="${id}"[^>]*>([^<]*)<`).exec(html)?.[1];
const rows = (html: string): string[][] =>
  [...html.matchAll(/<tr>(.*?)<\/tr>/g)].map((m) => [...m[1].matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/g)].map((c) => c[1]));

const hitRate = {
  title: "Prefix cost by hit rate",
  description: "Both entries cost more than no caching at low hit rates.",
  x: [0, 50, 100],
  series: [
    { name: "5-minute entry", values: [125, 67.5, 10] },
    { name: "1-hour entry", values: [200, 105, 10] },
  ],
  xLabel: "Cache hit rate (%)",
  yLabel: "Prefix cost (% of no caching)",
  unit: "%",
};

describe("Chart", () => {
  const html = renderToStaticMarkup(<Chart type="line" {...hitRate} reference={{ value: 100, label: "No caching" }} />);

  it("is one image to assistive tech, named by its title and described by its description", () => {
    expect(html.match(/role="img"/g)).toHaveLength(1);
    const labelledBy = attr(html, "div", "aria-labelledby")!;
    const describedBy = attr(html, "div", "aria-describedby")!;
    expect(textOfId(html, labelledBy)).toBe(hitRate.title);
    expect(textOfId(html, describedBy)).toBe(hitRate.description);
  });

  it("carries the numbers in a visually hidden table outside the image", () => {
    const imgEnd = html.indexOf("</svg>");
    expect(html.indexOf("<table")).toBeGreaterThan(imgEnd);
    expect(attr(html, "table", "class")).toContain("sr-only");
    expect(/<caption>([^<]*)<\/caption>/.exec(html)?.[1]).toBe("Data for the chart: Prefix cost by hit rate");
    expect(rows(html)).toEqual([
      ["Cache hit rate (%)", "5-minute entry", "1-hour entry"],
      ["0", "125%", "200%"],
      ["50", "67.5%", "105%"],
      ["100", "10%", "10%"],
    ]);
  });

  it("draws one line per series and a reference line, coloured only through CSS custom properties", () => {
    expect(html.match(/<path\b[^>]*data-series=/g)).toHaveLength(2);
    expect(html).toContain("No caching");
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(html).not.toMatch(/\b(rgb|hsl)a?\(/i);
    expect(html).toMatch(/var\(--chart-1/);
  });

  it("labels the axes and the ticks", () => {
    expect(html).toContain("Cache hit rate (%)");
    expect(html).toContain("Prefix cost (% of no caching)");
    for (const tick of ["0%", "50%", "100%", "150%", "200%"]) expect(html).toContain(`>${tick}<`);
  });

  it("draws a bar per value in a bar chart, starting from zero", () => {
    const bars = renderToStaticMarkup(
      <Chart type="bar" title="Prefix cost over ten turns" description="d" x={["None", "5-minute", "1-hour"]} series={[{ name: "Cost", values: [0.4, 0.5, 0.116] }]} xLabel="Cache entry" yLabel="Dollars" />,
    );
    expect(bars.match(/<rect\b[^>]*data-series=/g)).toHaveLength(3);
    expect(bars).toContain(">0.0<");
    expect(rows(bars)[3]).toEqual(["1-hour", "0.116"]);
  });
});

describe("Quote", () => {
  const html = renderToStaticMarkup(
    <Quote author="Ada Example" handle="ada" date="2026-09-30" href="https://x.com/ada/status/1">
      Caching is a pricing feature as much as a speed one.
    </Quote>,
  );

  it("quotes the post as a plain blockquote that cites the original", () => {
    expect(attr(html, "blockquote", "cite")).toBe("https://x.com/ada/status/1");
    expect(html).toContain("Caching is a pricing feature as much as a speed one.");
    expect(html).toContain("Ada Example");
    expect(html).toContain("@ada");
    expect(html).toContain('<time dateTime="2026-09-30">30 September 2026</time>');
  });

  it("links to the original in a new tab, safely, and says so to screen readers", () => {
    expect(attr(html, "a", "href")).toBe("https://x.com/ada/status/1");
    expect(attr(html, "a", "target")).toBe("_blank");
    expect(attr(html, "a", "rel")).toBe("noopener noreferrer");
    expect(html).toMatch(/<span class="sr-only">\s*\(opens in a new tab\)<\/span>/);
  });

  it("loads nothing from X: no script, image or frame", () => {
    expect(html).not.toMatch(/<(script|img|iframe)\b/);
  });
});

describe("Figure", () => {
  it("wraps its content with a caption and a linked credit line", () => {
    const html = renderToStaticMarkup(
      <Figure caption="Prefix cost against hit rate." credit="scripts/prompt-cache-maths.mjs" creditHref="https://example.com/maths">
        <p>chart</p>
      </Figure>,
    );
    expect(html).toMatch(/^<figure\b/);
    expect(html).toContain("<p>chart</p>");
    expect(/<figcaption[^>]*>(.*)<\/figcaption>/.exec(html)?.[1]).toContain("Prefix cost against hit rate.");
    expect(attr(html, "a", "href")).toBe("https://example.com/maths");
    expect(html).toContain(">scripts/prompt-cache-maths.mjs</a>");
  });

  it("leaves the credit line out when there is none", () => {
    const html = renderToStaticMarkup(<Figure caption="Just a caption.">x</Figure>);
    expect(html).not.toContain("Source");
    expect(html).not.toContain("<a");
  });
});

describe("Pre", () => {
  it("makes a code block a keyboard-scrollable region that keeps its classes and code", () => {
    const html = renderToStaticMarkup(
      <Pre className="language-js">
        <code>{"const x = 1;"}</code>
      </Pre>,
    );
    expect(attr(html, "pre", "tabindex")).toBe("0");
    expect(attr(html, "pre", "class")).toBe("language-js");
    expect(html).toContain("<code>const x = 1;</code>");
  });
});

describe("Table", () => {
  it("makes a Markdown table a keyboard-scrollable region, since wide tables scroll inside the article on a phone", () => {
    const html = renderToStaticMarkup(
      <Table>
        <tbody>
          <tr>
            <td>1.25×</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(attr(html, "table", "tabindex")).toBe("0");
    expect(html).toContain("<td>1.25×</td>");
  });
});
