// Page proof against a running site (plans/site-v2.md slice 9, grill items 7 and 9). Starts nothing:
// run `npm run build && npm start -p 3119` (or `npm run dev`) first, then
//
//   npm run check:pages [-- <base URL>]            axe, rendered controls and the /cv print check
//   npm run shots [-- <base URL>] [--out <dir>]    the same, plus full-page screenshots (default design/shots/)
//
// Every route (/, /cv, /writing, each post linked from /writing, /about and a missing page) is opened at
// 375x812 and 1440x900 in light and dark (emulated prefers-color-scheme):
//   (a) axe-core with the wcag2a, wcag2aa, wcag21aa and wcag22aa tags; any serious or critical violation
//       or any colour-contrast one fails;
//   (b) the rendered DOM's controls against design/CONTROLS.json, with the same counting code as
//       `npm run lint:slop -- --built` (findControls and lintControls in src/lib/slop.ts); on / the
//       invaders game is also opened from the alien, its dialog's controls checked against
//       "dialogs.invaders", and Escape must hand focus back to the alien;
//   (c) with --shots, a full-page PNG per page, width and theme, palette-reduced with sharp to under 300KB;
//   (d) /cv printed while the system theme is dark: PDFs at A4 and Letter (into a temporary folder), at
//       most 2 pages each, no nav or footer on the page, and all text dark on light paper.
//
// Browser: CHECK_PAGES_CHROMIUM if set, else the build playwright-core expects, else the newest Chromium
// in the Playwright cache (PLAYWRIGHT_BROWSERS_PATH or ~/.cache/ms-playwright). Nothing is downloaded.
// Exit 0 when every check passes, 1 on any failure, 2 when the site or a browser cannot be reached.
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { type Browser, type Page, chromium } from "playwright-core";
import sharp from "sharp";
import { blocking, isDarkOnLight, pageRoutes, pdfPageCount, pickChromium, shotFile } from "../src/lib/check-pages.ts";
import { type ControlsBudget, entriesFor, lintControls } from "../src/lib/slop.ts";

const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];
const THEMES = ["light", "dark"] as const;
const MAX_SHOT = 300 * 1024;
const MISSING = "/check-pages-missing-page";
const PAPER = "rgb(255, 255, 255)";

type AxeViolation = { id: string; impact: string | null; help: string; targets: string[]; count: number };
type AxeWindow = { axe: { run: (ctx: Document, opts: object) => Promise<{ violations: { id: string; impact: string | null; help: string; nodes: { target: unknown[] }[] }[] }> } };

function fail(message: string): never {
  console.error(`check-pages: ${message}`);
  process.exit(2);
}

const args = process.argv.slice(2);
let base = "http://localhost:3005";
let shots = false;
let outDir = "design/shots";
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--shots") shots = true;
  else if (a === "--out") outDir = args[++i] ?? fail("--out needs a folder");
  else if (a.startsWith("--")) fail(`unknown option ${a}`);
  else base = a.replace(/\/$/, "");
}

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf-8");
const budget = JSON.parse(fs.readFileSync("design/CONTROLS.json", "utf-8")) as ControlsBudget;

async function launch(): Promise<{ browser: Browser; from: string }> {
  const override = process.env.CHECK_PAGES_CHROMIUM;
  if (override) {
    if (!fs.existsSync(override)) fail(`CHECK_PAGES_CHROMIUM is set but ${override} does not exist`);
    return { browser: await chromium.launch({ executablePath: override }), from: `${override} (CHECK_PAGES_CHROMIUM)` };
  }
  try {
    return { browser: await chromium.launch(), from: "playwright-core's own build in the cache" };
  } catch (e) {
    if (!/Executable doesn't exist/.test(String(e))) throw e;
  }
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), ".cache", "ms-playwright");
  const names = fs.existsSync(root) ? fs.readdirSync(root) : [];
  const found = pickChromium(root, names, (p) => fs.existsSync(p));
  if (!found) fail(`no Chromium in ${root}; set CHECK_PAGES_CHROMIUM to a Chromium or Chrome binary`);
  return { browser: await chromium.launch({ executablePath: found }), from: found };
}

async function runAxe(page: Page): Promise<AxeViolation[]> {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async (tags) => {
    const { axe } = window as unknown as AxeWindow;
    const r = await axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
  }, TAGS);
}

/** Palette-reduce a PNG until it is under 300KB, then shrink it if colours alone are not enough. */
async function shrink(png: Buffer, width: number): Promise<{ out: Buffer; note: string }> {
  for (const colours of [256, 128, 64, 32]) {
    const out = await sharp(png).png({ palette: true, colours, compressionLevel: 9, effort: 10 }).toBuffer();
    if (out.length < MAX_SHOT) return { out, note: `${colours} colours` };
  }
  for (const scale of [0.75, 0.5]) {
    const w = Math.round(width * scale);
    const out = await sharp(png).resize({ width: w }).png({ palette: true, colours: 64, compressionLevel: 9, effort: 10 }).toBuffer();
    if (out.length < MAX_SHOT) return { out, note: `64 colours, resized to ${w}px wide` };
  }
  const out = await sharp(png).resize({ width: Math.round(width / 2) }).png({ palette: true, colours: 32, compressionLevel: 9 }).toBuffer();
  return { out, note: "32 colours, half width (still over 300KB)" };
}

async function printCheck(browser: Browser, problems: string[]): Promise<void> {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[1], colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(`${base}/cv`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print", colorScheme: "dark" });
  await page.evaluate(() => document.fonts.ready);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-pages-print-"));
  for (const format of ["A4", "Letter"] as const) {
    // printBackground false is the browser's own default ("Background graphics" off): the paper is white.
    const pdf = await page.pdf({ format, printBackground: false, path: path.join(dir, `cv-${format}.pdf`) });
    const pages = pdfPageCount(pdf);
    const ok = pages >= 1 && pages <= 2;
    console.log(`${ok ? "pass" : "FAIL"}  print /cv ${format}: ${pages} page${pages === 1 ? "" : "s"} (${(pdf.length / 1024).toFixed(0)} KB, ${path.join(dir, `cv-${format}.pdf`)})`);
    if (!ok) problems.push(`print /cv ${format}: ${pages} pages, at most 2 allowed`);
  }
  const chrome = await page.evaluate(() =>
    [...document.querySelectorAll("nav, footer, [role=navigation], [role=contentinfo]")]
      .filter((el) => el.checkVisibility({ visibilityProperty: true }))
      .map((el) => `<${el.tagName.toLowerCase()}> "${(el as HTMLElement).innerText.replace(/\s+/g, " ").trim().slice(0, 60)}"`),
  );
  console.log(`${chrome.length ? "FAIL" : "pass"}  print /cv: ${chrome.length ? `nav or footer printed: ${chrome.join("; ")}` : "no nav or footer on the page"}`);
  if (chrome.length) problems.push(`print /cv: nav or footer printed (${chrome.length})`);
  const colours = await page.evaluate(() => {
    // Visually hidden text never reaches the paper: sr-only clips its box away (clip-path inset(50%),
    // or the older clip rect(0 0 0 0)) inside a 1px box with overflow hidden; padding can widen the box.
    const clipped = (el: Element | null): boolean => {
      for (let e = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        if (s.clipPath === "inset(50%)" || /^rect\(0px,? 0px,? 0px,? 0px\)$/.test(s.clip)) return true;
        if (s.overflow === "hidden" && (r.width <= 1 || r.height <= 1)) return true;
      }
      return false;
    };
    const seen = new Map<string, string>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || !n.textContent?.trim() || !el.checkVisibility({ visibilityProperty: true, opacityProperty: true }) || clipped(el)) continue;
      const color = getComputedStyle(el).color;
      if (!seen.has(color)) seen.set(color, n.textContent.trim().slice(0, 40));
    }
    return [...seen].map(([color, sample]) => ({ color, sample }));
  });
  const light = colours.filter((c) => !isDarkOnLight(c.color, PAPER));
  console.log(
    `${light.length ? "FAIL" : "pass"}  print /cv: ${colours.length} text colour${colours.length === 1 ? "" : "s"} on white paper` +
      (light.length ? `, ${light.length} not dark on light: ${light.map((c) => `${c.color} ("${c.sample}")`).join("; ")}` : ", all dark on light"),
  );
  if (light.length) problems.push(`print /cv: ${light.length} text colours not dark on light`);
  await ctx.close();
}

/**
 * Opens the invaders game from the alien on / (grill item 7), once with motion and once with reduced
 * motion (which opens on a still frame with a "Play anyway" button), and checks the rendered controls
 * against the layout, the home page and CONTROLS.json's "dialogs.invaders" entries; then Escape must
 * close the game and put focus back on the alien.
 */
async function gameCheck(browser: Browser, problems: string[]): Promise<void> {
  const entries = [...(entriesFor(budget, "/") ?? []), ...(budget.dialogs?.invaders ?? [])];
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const label = `/ 1440 with the game open (reduced motion: ${reducedMotion})`;
    const ctx = await browser.newContext({ viewport: VIEWPORTS[1], reducedMotion });
    const page = await ctx.newPage();
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    const alien = page.locator("footer").getByRole("button", { name: /play space invaders/i });
    await alien.click();
    const dialog = page.locator("dialog[open]");
    await dialog.waitFor({ state: "visible", timeout: 10_000 });
    if (reducedMotion === "reduce") await dialog.getByRole("button", { name: "Play anyway" }).waitFor({ timeout: 5_000 });
    const names = await dialog.evaluate((d) =>
      [...d.querySelectorAll("a[href], button, input, select, textarea, [tabindex='0']")].map((el) => (el as HTMLElement).innerText.trim() || el.getAttribute("aria-label") || el.tagName),
    );
    const hits = lintControls(label, await page.content(), entries, "/ (game open)");
    console.log(`${hits.length ? "FAIL" : "pass"}  controls ${label}: dialog has ${names.map((n) => `"${n}"`).join(", ")}`);
    for (const h of hits) console.log(`        ${h.rule} ${h.message}`);
    if (hits.length) problems.push(`controls ${label}: ${hits.length} hits`);
    if (reducedMotion === "no-preference") {
      // A phone turned on its side, or a window resized, must re-lay the game out to the new screen.
      await page.setViewportSize(VIEWPORTS[0]);
      const fits = await page
        .waitForFunction(
          () => {
            const c = document.querySelector<HTMLCanvasElement>("dialog[open] canvas");
            return !!c && c.width === Math.round(innerWidth * devicePixelRatio) && c.height === Math.round(innerHeight * devicePixelRatio);
          },
          null,
          { timeout: 2_000 },
        )
        .then(() => true)
        .catch(() => false);
      const size = await page.evaluate(() => {
        const c = document.querySelector<HTMLCanvasElement>("dialog[open] canvas");
        return `${c?.width}x${c?.height}`;
      });
      console.log(`${fits ? "pass" : "FAIL"}  game ${label}: resized to ${VIEWPORTS[0].width}x${VIEWPORTS[0].height}, canvas ${size}`);
      if (!fits) problems.push(`game ${label}: canvas not re-laid out after a resize (${size})`);
      await page.setViewportSize(VIEWPORTS[1]);
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    // The game hands focus back on the next animation frame, after it unmounts; wait for it, up to 2s.
    const back = await page
      .waitForFunction(() => document.activeElement?.tagName === "BUTTON" && document.activeElement.closest("footer") !== null, null, { timeout: 2_000 })
      .then(() => true)
      .catch(() => false);
    console.log(`${back ? "pass" : "FAIL"}  game ${label}: Escape closes it and focus is back on the alien`);
    if (!back) problems.push(`game ${label}: focus not back on the alien after Escape`);
    await ctx.close();
  }
}

async function main(): Promise<number> {
  try {
    const res = await fetch(`${base}/writing`);
    if (!res.ok) fail(`${base}/writing answered ${res.status}`);
  } catch (e) {
    fail(`nothing answers at ${base} (${(e as Error).message}); start the site first, e.g. npm run build && npm start -p 3119`);
  }
  const { browser, from } = await launch();
  console.log(`check-pages: ${base} with Chromium ${browser.version()} from ${from}\n`);
  const problems: string[] = [];

  const first = await browser.newPage();
  await first.goto(`${base}/writing`, { waitUntil: "networkidle" });
  const slugs = await first.$$eval('a[href^="/writing/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")!.slice("/writing/".length)))]);
  await first.close();
  const routes = pageRoutes(slugs, MISSING);
  if (shots) fs.mkdirSync(outDir, { recursive: true });

  const axeRows: string[] = [];
  const shotRows: string[] = [];
  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({ viewport, colorScheme: theme });
      const page = await ctx.newPage();
      for (const route of routes) {
        const res = await page.goto(`${base}${route.path}`, { waitUntil: "networkidle" });
        const status = res?.status() ?? 0;
        const want = route.pattern === "/_not-found" ? 404 : 200;
        if (status !== want) problems.push(`${route.path}: HTTP ${status}, expected ${want}`);
        await page.evaluate(() => document.fonts.ready);
        const label = `${route.path} ${viewport.width} ${theme}`;

        const violations = await runAxe(page);
        const bad = blocking(violations);
        axeRows.push(`${bad.length ? "FAIL" : "pass"}  axe ${label.padEnd(44)} ${violations.length} violation${violations.length === 1 ? "" : "s"}, ${bad.length} blocking`);
        for (const v of violations) {
          axeRows.push(`        ${bad.includes(v) ? "x" : "-"} ${v.id} (${v.impact}, ${v.count} node${v.count === 1 ? "" : "s"}): ${v.help} | ${v.targets.join(", ")}`);
        }
        if (bad.length) problems.push(`axe ${label}: ${bad.map((v) => v.id).join(", ")}`);

        // Controls do not change with the theme, so the rendered DOM is checked once per width.
        if (theme === "light") {
          const hits = lintControls(label, await page.content(), entriesFor(budget, route.pattern), route.pattern);
          console.log(`${hits.length ? "FAIL" : "pass"}  controls ${route.path} ${viewport.width} (${route.pattern})`);
          for (const h of hits) console.log(`        ${h.rule} ${h.message}`);
          if (hits.length) problems.push(`controls ${route.path} ${viewport.width}: ${hits.length} hits`);
        }

        if (shots) {
          const png = await page.screenshot({ fullPage: true, animations: "disabled" });
          const { out, note } = await shrink(png, viewport.width);
          const file = path.join(outDir, shotFile(route.name, viewport.width, theme));
          fs.writeFileSync(file, out);
          const over = out.length >= MAX_SHOT;
          shotRows.push(`${over ? "FAIL" : "pass"}  shot ${file} ${(out.length / 1024).toFixed(0)} KB (${note})`);
          if (over) problems.push(`shot ${file} is ${(out.length / 1024).toFixed(0)} KB, over 300KB`);
        }
      }
      await ctx.close();
    }
  }
  console.log("");
  await gameCheck(browser, problems);
  console.log("");
  for (const row of axeRows) console.log(row);
  console.log("");
  await printCheck(browser, problems);
  if (shotRows.length) {
    console.log("");
    for (const row of shotRows) console.log(row);
  }
  await browser.close();

  console.log(`\ncheck-pages: ${routes.length} pages x ${VIEWPORTS.length} widths x ${THEMES.length} themes, ${problems.length} problem${problems.length === 1 ? "" : "s"}`);
  for (const p of problems) console.log(`  ${p}`);
  return problems.length ? 1 : 0;
}

process.exit(await main());
