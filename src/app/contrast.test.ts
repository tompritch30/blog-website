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

// Light only (owner decision, 4 Oct 2026): one set of colour tokens, no dark theme, no toggle.
const light = tokens(css.match(/^:root \{([^}]*)\}/m)![1]);

describe("colour tokens", () => {
  it("knows the contrast of black on white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("is light only: no dark colour scheme anywhere, and the page says it is light", () => {
    expect(css).not.toMatch(/prefers-color-scheme/);
    expect(css).not.toMatch(/color-scheme:\s*dark/);
    expect(css).toMatch(/^:root \{[^}]*color-scheme: light;/m);
  });

  for (const fg of ["text", "secondary", "link"]) {
    for (const bg of ["bg", "surface", "surface-soft"]) {
      it(`--${fg} on --${bg} meets WCAG AA (4.5:1)`, () => {
        expect(contrast(light[fg], light[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
