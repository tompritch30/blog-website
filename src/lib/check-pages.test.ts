import { describe, expect, it } from "vitest";
import { blocking, pageRoutes, pickChromium, shotFile } from "./check-pages";

describe("pageRoutes", () => {
  it("lists every page with the route pattern CONTROLS.json keys it by and a screenshot name", () => {
    expect(pageRoutes(["prompt-caching", "claude-code-workflow"], "/no-such-page")).toEqual([
      { path: "/", pattern: "/", name: "home" },
      { path: "/writing", pattern: "/writing", name: "writing" },
      { path: "/writing/prompt-caching", pattern: "/writing/[slug]", name: "writing-prompt-caching" },
      { path: "/writing/claude-code-workflow", pattern: "/writing/[slug]", name: "writing-claude-code-workflow" },
      { path: "/about", pattern: "/about", name: "about" },
      { path: "/no-such-page", pattern: "/_not-found", name: "404" },
    ]);
  });
});

describe("shotFile", () => {
  it("names a screenshot <route>-<width>-light.png (the site is light only)", () => {
    expect(shotFile("writing-prompt-caching", 375)).toBe("writing-prompt-caching-375-light.png");
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
