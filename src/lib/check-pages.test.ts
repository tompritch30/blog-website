import { describe, expect, it } from "vitest";
import { blocking, contrastRatio, isDarkOnLight, pageRoutes, parseRgb, pdfPageCount, pickChromium, shotFile } from "./check-pages";

describe("pageRoutes", () => {
  it("lists every page with the route pattern CONTROLS.json keys it by and a screenshot name", () => {
    expect(pageRoutes(["prompt-caching", "claude-code-workflow"], "/no-such-page")).toEqual([
      { path: "/", pattern: "/", name: "home" },
      { path: "/cv", pattern: "/cv", name: "cv" },
      { path: "/writing", pattern: "/writing", name: "writing" },
      { path: "/writing/prompt-caching", pattern: "/writing/[slug]", name: "writing-prompt-caching" },
      { path: "/writing/claude-code-workflow", pattern: "/writing/[slug]", name: "writing-claude-code-workflow" },
      { path: "/about", pattern: "/about", name: "about" },
      { path: "/no-such-page", pattern: "/_not-found", name: "404" },
    ]);
  });
});

describe("shotFile", () => {
  it("names a screenshot <route>-<width>-<theme>.png", () => {
    expect(shotFile("writing-prompt-caching", 375, "dark")).toBe("writing-prompt-caching-375-dark.png");
  });
});

describe("blocking", () => {
  it("keeps serious and critical violations and every colour-contrast one, whatever its impact", () => {
    const violations = [
      { id: "region", impact: "moderate" },
      { id: "color-contrast", impact: "serious" },
      { id: "color-contrast-enhanced", impact: "moderate" },
      { id: "image-alt", impact: "critical" },
      { id: "landmark-unique", impact: "minor" },
      { id: "color-contrast", impact: null },
    ];
    expect(blocking(violations).map((v) => `${v.id}:${v.impact}`)).toEqual([
      "color-contrast:serious",
      "color-contrast-enhanced:moderate",
      "image-alt:critical",
      "color-contrast:null",
    ]);
  });
});

describe("colour checks", () => {
  it("reads rgb() and rgba() as Chromium serialises computed colours", () => {
    expect(parseRgb("rgb(240, 240, 238)")).toEqual({ r: 240, g: 240, b: 238, a: 1 });
    expect(parseRgb("rgba(0, 0, 0, 0)")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseRgb("transparent")).toBeNull();
  });

  it("knows the contrast of black on white and of the light theme's grey on white", () => {
    expect(contrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(21, 5);
    // #6b6b69: channel 107/255 linearises to about 0.147, so (1.05) / (0.147 + 0.05) is about 5.33.
    expect(contrastRatio("rgb(107, 107, 105)", "rgb(255, 255, 255)")).toBeCloseTo(5.33, 1);
  });

  it("calls text dark on light only when it is darker than the paper and meets 4.5:1", () => {
    expect(isDarkOnLight("rgb(15, 15, 14)", "rgb(255, 255, 255)")).toBe(true);
    expect(isDarkOnLight("rgb(107, 107, 105)", "rgb(255, 255, 255)")).toBe(true);
    // The dark theme's text and its grey (#8a8a88, about 3.45:1) both fail on white paper.
    expect(isDarkOnLight("rgb(240, 240, 238)", "rgb(255, 255, 255)")).toBe(false);
    expect(isDarkOnLight("rgb(138, 138, 136)", "rgb(255, 255, 255)")).toBe(false);
    // Light text on a dark box is readable but is not dark on light.
    expect(isDarkOnLight("rgb(255, 255, 255)", "rgb(0, 0, 0)")).toBe(false);
  });
});

describe("pdfPageCount", () => {
  it("counts page objects, not the page tree", () => {
    const pdf = "%PDF-1.4\n1 0 obj << /Type /Pages /Kids [2 0 R 3 0 R] /Count 2 >>\n2 0 obj << /Type /Page /Parent 1 0 R >>\n3 0 obj <</Type/Page/Parent 1 0 R>>\n";
    expect(pdfPageCount(Buffer.from(pdf, "latin1"))).toBe(2);
  });
});

describe("pickChromium", () => {
  const root = "/home/u/.cache/ms-playwright";
  const cache = ["chromium-1179", "chromium-1234", "chromium_headless_shell-1179", "chromium_headless_shell-1234", "ffmpeg-1011"];

  it("prefers the newest cached headless shell", () => {
    const files = new Set([
      `${root}/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell`,
      `${root}/chromium_headless_shell-1179/chrome-linux/headless_shell`,
      `${root}/chromium-1234/chrome-linux64/chrome`,
    ]);
    expect(pickChromium(root, cache, (p) => files.has(p))).toBe(`${root}/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell`);
  });

  it("falls back to an older shell's layout, then to full Chromium, when newer folders are incomplete", () => {
    const older = new Set([`${root}/chromium_headless_shell-1179/chrome-linux/headless_shell`]);
    expect(pickChromium(root, cache, (p) => older.has(p))).toBe(`${root}/chromium_headless_shell-1179/chrome-linux/headless_shell`);
    const full = new Set([`${root}/chromium-1179/chrome-linux/chrome`]);
    expect(pickChromium(root, cache, (p) => full.has(p))).toBe(`${root}/chromium-1179/chrome-linux/chrome`);
  });

  it("returns null when nothing usable is cached", () => {
    expect(pickChromium(root, ["ffmpeg-1011"], () => true)).toBeNull();
  });
});
