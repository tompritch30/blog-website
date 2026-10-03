import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(path.join(__dirname, "globals.css"), "utf-8");

function tokens(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const light = tokens(css.match(/^:root \{([^}]*)\}/m)![1]);
const dark = tokens(css.match(/prefers-color-scheme: dark\) \{\s*:root \{([^}]*)\}/)![1]);

describe("colour tokens", () => {
  it("knows the contrast of black on white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  for (const [theme, t] of [["light", light], ["dark", dark]] as const) {
    for (const fg of ["text", "secondary", "muted"]) {
      for (const bg of ["bg", "surface", "surface-soft"]) {
        it(`${theme}: --${fg} on --${bg} meets WCAG AA (4.5:1)`, () => {
          expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  }
});
