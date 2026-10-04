// Page proof against a running site (plans/site-v2.md slice 9, grill items 7 and 9). Starts nothing.
// The default base URL is http://localhost:3005, where `npm run dev` serves; for the production build,
// run `npm run build && npm start -p 3119` first and pass http://localhost:3119:
//
//   npm run check:pages [-- <base URL>]            axe, rendered controls and the nav
//   npm run shots [-- <base URL>] [--out <dir>]    the same, plus full-page screenshots (default design/shots/)
//
// Every route (/, /writing, each post linked from /writing, /about and a missing page) is opened at
// 375x812 and 1440x900 (light only, owner decision 4 Oct 2026; the context still asks for light):
//   (a) axe-core with the wcag2a, wcag2aa, wcag21aa and wcag22aa tags; any serious or critical violation
//       or any colour-contrast one fails;
//   (b) the rendered DOM's controls against design/CONTROLS.json, with the same counting code as
//       `npm run lint:slop -- --built` (findControls and lintControls in src/lib/slop.ts); on / the
//       invaders game is also opened from the alien in the header with every mystery link already won;
//       P must pause it with Resume focused and the three links listed as new-tab links, its dialog's
//       controls are checked against "dialogs.invaders", and Escape must then close it and hand focus
//       back to the alien;
//   (b1) a mystery-ship hit, staged by the test-only `?invaders-test` query (stageHit in
//       src/lib/invaders/hit.ts), must pause the game with "Open ForestVO paper" focused; Enter on it must
//       open a new page at the paper's URL (answered locally, never fetched) while this page stays
//       paused with the game showing; with --shots it saves game-hit-1440-light.png;
//   (b2) the header nav: its links and the alien sit on one line, the alien's button is at least 28x28
//       (WCAG 2.2 target size), and the page does not scroll sideways, at both widths;
//   (c) with --shots, a full-page PNG per page and width, palette-reduced with sharp to under 300KB.
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
import { blocking, pageRoutes, pickChromium, shotFile } from "../src/lib/check-pages.ts";
import { MYSTERY_TARGETS, UNLOCKED_KEY } from "../src/lib/invaders/links.ts";
import { type ControlsBudget, entriesFor, lintControls } from "../src/lib/slop.ts";

const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];
const MAX_SHOT = 300 * 1024;
const MISSING = "/check-pages-missing-page";
// The mystery ship's links in rotation, seeded as already won.
const UNLOCKED = MYSTERY_TARGETS.map((t) => t.href);
// WCAG 2.2 target size asks for 24x24; the alien's button is drawn at 28x28.
const ALIEN_MIN = 28;

type AxeViolation = { id: string; impact: string | null; help: string; targets: string[]; count: number };
type AxeWindow = { axe: { run: (ctx: Document, opts: object) => Promise<{ violations: { id: string; impact: string | null; help: string; nodes: { target: unknown[] }[] }[] }> } };

function fail(message: string): never {
  console.error(`check-pages: ${message}`);
  process.exit(2);
}

const args = process.argv.slice(2);
// `npm run dev` (package.json, ADR 0002 item 8)
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

/**
 * The header nav on the page as rendered: its list items (Writing, About and the alien) on one line,
 * the alien's button at least ALIEN_MIN square, and nothing wider than the viewport. Only the li items
 * are measured: at 375 the name sits on its own line above them by design.
 */
async function navCheck(page: Page, label: string, problems: string[]): Promise<void> {
  const nav = await page.evaluate(() => {
    const items = [...document.querySelectorAll("header nav li")].map((li) => li.getBoundingClientRect());
    const alien = document.querySelector("header nav button[aria-label='Play space invaders']")?.getBoundingClientRect();
    return {
      items: items.length,
      // one line when every item overlaps every other vertically
      oneLine: items.length > 0 && Math.max(...items.map((r) => r.top)) < Math.min(...items.map((r) => r.bottom)),
      right: Math.round(Math.max(...items.map((r) => r.right))),
      scrollWidth: document.documentElement.scrollWidth,
      width: innerWidth,
      alien: alien ? { w: Math.round(alien.width), h: Math.round(alien.height) } : null,
    };
  });
  const why: string[] = [];
  if (!nav.oneLine) why.push("items wrap onto more than one line");
  if (nav.right > nav.width) why.push(`items reach ${nav.right}px in a ${nav.width}px viewport`);
  if (nav.scrollWidth > nav.width) why.push(`page scrolls sideways (${nav.scrollWidth}px wide)`);
  if (!nav.alien) why.push("no alien button in the header nav");
  else if (nav.alien.w < ALIEN_MIN || nav.alien.h < ALIEN_MIN) why.push(`alien target ${nav.alien.w}x${nav.alien.h}, under ${ALIEN_MIN}x${ALIEN_MIN}`);
  const alien = nav.alien ? `alien ${nav.alien.w}x${nav.alien.h}` : "no alien";
  console.log(`${why.length ? "FAIL" : "pass"}  nav ${label}: ${nav.items} items, ${nav.oneLine ? "one line" : "wrapped"}, right edge ${nav.right}/${nav.width}px, ${alien}${why.length ? ` (${why.join("; ")})` : ""}`);
  if (why.length) problems.push(`nav ${label}: ${why.join("; ")}`);
}

/**
 * Opens the invaders game from the alien in the header nav on / (grill item 7), once with motion and once with reduced
 * motion (which opens on a still frame with a "Play anyway" button). With motion, P pauses it and the
 * pause screen must list the won links. The rendered controls are checked against the layout, the home
 * page and CONTROLS.json's "dialogs.invaders" entries; then Escape (from the pause screen or the still
 * frame) must close the game and put focus back on the alien.
 */
async function gameCheck(browser: Browser, problems: string[]): Promise<void> {
  const entries = [...(entriesFor(budget, "/") ?? []), ...(budget.dialogs?.invaders ?? [])];
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const label = `/ 1440 with the game open (reduced motion: ${reducedMotion})`;
    const ctx = await browser.newContext({ viewport: VIEWPORTS[1], reducedMotion });
    // A returning player: every mystery-ship link already won, so the pause screen lists all three.
    await ctx.addInitScript(({ key, list }) => window.localStorage.setItem(key, JSON.stringify(list)), { key: UNLOCKED_KEY, list: UNLOCKED });
    const page = await ctx.newPage();
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    const alien = page.locator("header nav").getByRole("button", { name: /play space invaders/i });
    const opened = await alien
      .click({ timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!opened) {
      console.log(`FAIL  game ${label}: no alien button in the header nav to open the game from`);
      problems.push(`game ${label}: no alien in the header nav`);
      await ctx.close();
      continue;
    }
    const dialog = page.locator("dialog[open]");
    await dialog.waitFor({ state: "visible", timeout: 10_000 });
    if (reducedMotion === "reduce") await dialog.getByRole("button", { name: "Play anyway" }).waitFor({ timeout: 5_000 });
    else {
      // P pauses: the pause screen shows, Resume takes focus, and the unlocked links are real new-tab links.
      await page.keyboard.press("p");
      const paused = await dialog
        .getByText("Paused.")
        .waitFor({ timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      const state = await dialog.evaluate((d) => ({
        focus: document.activeElement?.textContent?.trim() ?? "",
        links: [...d.querySelectorAll("a[href]")].map((a) => `${a.getAttribute("href")} ${a.getAttribute("target")} ${a.getAttribute("rel")}`),
      }));
      const want = UNLOCKED.map((href) => `${href} _blank noopener noreferrer`);
      const ok = paused && state.focus === "Resume" && JSON.stringify(state.links) === JSON.stringify(want);
      console.log(`${ok ? "pass" : "FAIL"}  game ${label}: P pauses, focus on "${state.focus}", ${state.links.length} unlocked links in new tabs`);
      if (!ok) problems.push(`game ${label}: pause screen wrong (paused ${paused}, focus "${state.focus}", links ${state.links.join("; ")})`);
    }
    const names = await dialog.evaluate((d) =>
      [...d.querySelectorAll("a[href], button, input, select, textarea, [tabindex='0']")].map((el) => (el as HTMLElement).innerText.trim() || el.getAttribute("aria-label") || el.tagName),
    );
    // The modal dialog sits over an inert page, so its links are compared with each other for the
    // duplicate rules, not with the page behind it; every control is still checked against the budget.
    const origins = [new URL(base).origin];
    const hits = [
      ...lintControls(label, await page.content(), entries, "/ (game open)", { origins }).filter((h) => !h.rule.startsWith("duplicate-")),
      ...lintControls(label, await dialog.evaluate((d) => d.outerHTML), budget.dialogs?.invaders ?? [], "the game dialog", { origins }).filter((h) => h.rule.startsWith("duplicate-")),
    ];
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
      .waitForFunction(() => document.activeElement?.tagName === "BUTTON" && document.activeElement.closest("header nav") !== null, null, { timeout: 2_000 })
      .then(() => true)
      .catch(() => false);
    console.log(`${back ? "pass" : "FAIL"}  game ${label}: Escape closes it and focus is back on the alien`);
    if (!back) problems.push(`game ${label}: focus not back on the alien after Escape`);
    await ctx.close();
  }
}

/**
 * A hit opens the link (owner, 4 Oct 2026): `?invaders-test` stages the mystery ship over the player
 * with a shot just below it, so the first frames of play hit it. The game must pause with the
 * "Open <paper>" link focused, Enter must open a new page at the paper's URL, and this page must stay
 * paused with the game on screen. The paper's host is routed to a local stub, so nothing leaves the
 * machine and only the new page's URL is read.
 */
async function hitCheck(browser: Browser, problems: string[]): Promise<void> {
  const label = "/ 1440 with a staged mystery-ship hit";
  const target = MYSTERY_TARGETS[0];
  const ctx = await browser.newContext({ viewport: VIEWPORTS[1] });
  await ctx.route(`${new URL(target.href).origin}/**`, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>stub</title>" }));
  const page = await ctx.newPage();
  await page.goto(`${base}/?invaders-test`, { waitUntil: "networkidle" });
  await page.locator("header nav").getByRole("button", { name: /play space invaders/i }).click();
  const dialog = page.locator("dialog[open]");
  const open = dialog.getByRole("link", { name: `Open ${target.label}` });
  const offered = await open
    .waitFor({ timeout: 5_000 })
    .then(() => true)
    .catch(() => false);
  const screen = () =>
    page.evaluate(() => {
      const d = document.querySelector("dialog[open]");
      const a = document.activeElement as HTMLAnchorElement | null;
      const canvas = d?.querySelector("canvas")?.getBoundingClientRect();
      return {
        open: !!d,
        text: d?.querySelector("div.absolute.left-1\\/2")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
        score: d?.querySelector("p.font-mono span")?.textContent ?? "",
        canvas: canvas ? `${Math.round(canvas.width)}x${Math.round(canvas.height)}` : "none",
        focus: a ? `${a.tagName} "${a.innerText.trim()}" ${a.getAttribute("href") ?? ""} ${a.getAttribute("target") ?? ""} ${a.getAttribute("rel") ?? ""}` : "none",
      };
    });
  const before = await screen();
  // the visible name, then the hidden "(opens in a new tab)", then where and how it opens
  const focused = before.focus.startsWith(`A "Open ${target.label} ↗`) && before.focus.endsWith(`" ${target.href} _blank noopener noreferrer`);
  console.log(`${offered && focused ? "pass" : "FAIL"}  hit ${label}: paused on "${before.text}", ${before.score}, focus on ${before.focus}`);
  if (!offered || !focused) problems.push(`hit ${label}: no focused Open link after the hit (focus ${before.focus})`);
  const dupes = lintControls(label, await dialog.evaluate((d) => d.outerHTML), budget.dialogs?.invaders ?? [], "the game dialog", { origins: [new URL(base).origin] });
  console.log(`${dupes.length ? "FAIL" : "pass"}  controls ${label}: hit screen within the budget, each place linked once`);
  for (const h of dupes) console.log(`        ${h.rule} ${h.message}`);
  if (dupes.length) problems.push(`controls ${label}: ${dupes.length} hits`);
  if (shots && offered) {
    const file = path.join(outDir, shotFile("game-hit", VIEWPORTS[1].width));
    const { out, note } = await shrink(await page.screenshot({ animations: "disabled" }), VIEWPORTS[1].width);
    fs.writeFileSync(file, out);
    console.log(`pass  shot ${file} ${(out.length / 1024).toFixed(0)} KB (${note})`);
  }
  if (offered) {
    const [tab] = await Promise.all([ctx.waitForEvent("page", { timeout: 5_000 }), page.keyboard.press("Enter")]);
    await tab.waitForURL((u) => u.href === target.href, { waitUntil: "commit", timeout: 5_000 }).catch(() => undefined);
    const url = tab.url();
    // still paused a moment later: the score has not moved and the game is on screen
    await page.waitForTimeout(500);
    const after = await screen();
    const ok = url === target.href && after.open && after.score === before.score && after.text === before.text && after.canvas !== "none";
    console.log(`${ok ? "pass" : "FAIL"}  hit ${label}: Enter opened a new page at ${url}; ${ctx.pages().length} pages; this page still paused (${after.score}, canvas ${after.canvas}, "${after.text}"), focus on ${after.focus}`);
    if (!ok) problems.push(`hit ${label}: new page at ${url}, this page ${JSON.stringify(after)}`);
  }
  await ctx.close();
}

async function main(): Promise<number> {
  try {
    const res = await fetch(`${base}/writing`);
    if (!res.ok) fail(`${base}/writing answered ${res.status}`);
  } catch (e) {
    fail(`nothing answers at ${base} (${(e as Error).message}); start the site first: npm run dev for the default, or npm run build && npm start -p 3119 and pass http://localhost:3119`);
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
    const ctx = await browser.newContext({ viewport, colorScheme: "light" });
    const page = await ctx.newPage();
    for (const route of routes) {
      const res = await page.goto(`${base}${route.path}`, { waitUntil: "networkidle" });
      const status = res?.status() ?? 0;
      const want = route.pattern === "/_not-found" ? 404 : 200;
      if (status !== want) problems.push(`${route.path}: HTTP ${status}, expected ${want}`);
      await page.evaluate(() => document.fonts.ready);
      const label = `${route.path} ${viewport.width}`;

      const violations = await runAxe(page);
      const bad = blocking(violations);
      axeRows.push(`${bad.length ? "FAIL" : "pass"}  axe ${label.padEnd(44)} ${violations.length} violation${violations.length === 1 ? "" : "s"}, ${bad.length} blocking`);
      for (const v of violations) {
        axeRows.push(`        ${bad.includes(v) ? "x" : "-"} ${v.id} (${v.impact}, ${v.count} node${v.count === 1 ? "" : "s"}): ${v.help} | ${v.targets.join(", ")}`);
      }
      if (bad.length) problems.push(`axe ${label}: ${bad.map((v) => v.id).join(", ")}`);

      const hits = lintControls(label, await page.content(), entriesFor(budget, route.pattern), route.pattern, { origins: [new URL(base).origin] });
      console.log(`${hits.length ? "FAIL" : "pass"}  controls ${route.path} ${viewport.width} (${route.pattern})`);
      for (const h of hits) console.log(`        ${h.rule} ${h.message}`);
      if (hits.length) problems.push(`controls ${route.path} ${viewport.width}: ${hits.length} hits`);
      await navCheck(page, label, problems);

      if (shots) {
        const png = await page.screenshot({ fullPage: true, animations: "disabled" });
        const { out, note } = await shrink(png, viewport.width);
        const file = path.join(outDir, shotFile(route.name, viewport.width));
        fs.writeFileSync(file, out);
        const over = out.length >= MAX_SHOT;
        shotRows.push(`${over ? "FAIL" : "pass"}  shot ${file} ${(out.length / 1024).toFixed(0)} KB (${note})`);
        if (over) problems.push(`shot ${file} is ${(out.length / 1024).toFixed(0)} KB, over 300KB`);
      }
    }
    await ctx.close();
  }
  console.log("");
  await gameCheck(browser, problems);
  await hitCheck(browser, problems);
  console.log("");
  for (const row of axeRows) console.log(row);
  if (shotRows.length) {
    console.log("");
    for (const row of shotRows) console.log(row);
  }
  await browser.close();

  console.log(`\ncheck-pages: ${routes.length} pages x ${VIEWPORTS.length} widths (light only), ${problems.length} problem${problems.length === 1 ? "" : "s"}`);
  for (const p of problems) console.log(`  ${p}`);
  return problems.length ? 1 : 0;
}

process.exit(await main());
