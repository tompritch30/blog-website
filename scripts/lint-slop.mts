// Slop lint CLI: runs the rules in src/lib/slop.ts over files and prints every hit.
//
//   npm run lint:slop                   scan src/ (tsx, ts, mdx, css), skipping the lint, its tests and fixtures
//   npm run lint:slop -- <path> ...     scan the given files or folders (html too)
//   npm run lint:slop -- --built [dir]  scan a production build (default .next): every prerendered page's
//                                       visible text, markup and controls, and the built CSS
//
// Options: --allow <file> (default design/slop-allow.json), --controls <file> (default design/CONTROLS.json).
// Exit 0 when clean, 1 on any hit, 2 on a usage or setup problem (no build output, a bad allowlist or budget).
// Node 22 runs this file directly (type stripping), so it imports slop.ts by its .ts name.
import fs from "node:fs";
import path from "node:path";
import { type Allow, type ControlsBudget, type Hit, entriesFor, lintControls, lintCss, lintFile, lintHtml } from "../src/lib/slop.ts";

const SOURCE_EXT = /\.(tsx|ts|mdx|css)$/;
const EXPLICIT_EXT = /\.(tsx|ts|mts|mdx|md|css|html)$/;
const DEFAULT_SKIP = ["src/lib/slop.ts", "src/lib/slop.test.ts", "src/lib/__fixtures__/slop/"];
const CONTROL_KINDS = ["link", "button", "input", "select", "textarea", "summary", "iframe", "role-button", "focusable", "prose links", "scroll regions"];

function fail(message: string): never {
  console.error(`lint-slop: ${message}`);
  process.exit(2);
}

const rel = (p: string) => path.relative(process.cwd(), p).split(path.sep).join("/") || p;

function walk(p: string, ext: RegExp, out: string[] = []): string[] {
  if (!fs.existsSync(p)) fail(`no such file or folder: ${p}`);
  if (fs.statSync(p).isDirectory()) {
    for (const f of fs.readdirSync(p).sort()) if (f !== "node_modules") walk(path.join(p, f), ext, out);
  } else if (ext.test(p)) out.push(rel(p));
  return out;
}

const readJson = <T,>(file: string, what: string): T => {
  if (!fs.existsSync(file)) fail(`${what} not found: ${file}`);
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch (e) {
    return fail(`${file} is not valid JSON: ${(e as Error).message}`);
  }
};

function loadAllow(file: string): Allow {
  const raw = readJson<Partial<Allow>>(file, "allowlist");
  const allow: Allow = {
    acronyms: raw.acronyms ?? [],
    properNouns: raw.properNouns ?? [],
    radius: raw.radius ?? [],
    money: raw.money ?? [],
  };
  for (const e of allow.radius) if (!e.component || !e.reason) fail(`${file}: every radius entry needs a component and a reason`);
  for (const e of allow.money) if (!Array.isArray(e.texts) || !e.reason) fail(`${file}: every money entry needs texts and a reason`);
  return allow;
}

function loadBudget(file: string): ControlsBudget {
  const budget = readJson<ControlsBudget>(file, "controls budget");
  if (!budget.routes || typeof budget.routes !== "object") fail(`${file}: needs a "routes" object`);
  const all = [...(budget.layout ?? []), ...Object.values(budget.routes).flatMap((r) => r.controls ?? [])];
  for (const e of all) if (!CONTROL_KINDS.includes(e.kind)) fail(`${file}: unknown control kind "${e.kind}" (one of ${CONTROL_KINDS.join(", ")})`);
  return budget;
}

/** The route pattern a built page belongs to, from the prerender manifest (`srcRoute`). */
function routeOf(htmlRoot: string, file: string, manifest: { routes?: Record<string, { srcRoute?: string }> }): string {
  const name = path.relative(htmlRoot, file).split(path.sep).join("/").replace(/\.html$/, "");
  const route = name === "index" ? "/" : `/${name}`;
  return manifest.routes?.[route]?.srcRoute ?? route;
}

function report(files: string[], hits: Hit[]): number {
  for (const h of hits) console.log(`${h.file}:${h.line} ${h.rule} ${h.message}${h.excerpt ? ` | ${h.excerpt}` : ""}`);
  if (hits.length) console.log("");
  const count = new Map<string, number>(files.map((f) => [f, 0]));
  for (const h of hits) count.set(h.file, (count.get(h.file) ?? 0) + 1);
  for (const [f, n] of count) console.log(n ? `FAIL  ${f}  ${n} hit${n === 1 ? "" : "s"}` : `pass  ${f}`);
  const failed = [...count.values()].filter((n) => n > 0).length;
  console.log(`\nslop: ${hits.length} hit${hits.length === 1 ? "" : "s"} in ${failed} of ${count.size} files`);
  return hits.length ? 1 : 0;
}

const args = process.argv.slice(2);
let allowFile = "design/slop-allow.json";
let controlsFile = "design/CONTROLS.json";
let built: string | null = null;
const targets: string[] = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--allow") allowFile = args[++i] ?? fail("--allow needs a file");
  else if (a === "--controls") controlsFile = args[++i] ?? fail("--controls needs a file");
  else if (a === "--built") built = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : ".next";
  else if (a.startsWith("--")) fail(`unknown option ${a}`);
  else targets.push(a);
}

const allow = loadAllow(allowFile);

if (built !== null) {
  if (targets.length) fail("--built takes a build folder, not file paths");
  const htmlRoot = path.join(built, "server", "app");
  if (!fs.existsSync(htmlRoot)) fail(`no build output at ${rel(htmlRoot)}: run \`npm run build\` first`);
  const budget = loadBudget(controlsFile);
  const manifestFile = path.join(built, "prerender-manifest.json");
  const manifest = fs.existsSync(manifestFile) ? readJson<{ routes?: Record<string, { srcRoute?: string }> }>(manifestFile, "manifest") : {};
  const pages = walk(htmlRoot, /\.html$/);
  const styles = fs.existsSync(path.join(built, "static")) ? walk(path.join(built, "static"), /\.css$/) : [];
  const hits: Hit[] = [];
  for (const f of pages) {
    const html = fs.readFileSync(f, "utf-8");
    const route = routeOf(htmlRoot, f, manifest);
    hits.push(...lintHtml(f, html, { allow, built: true }), ...lintControls(f, html, entriesFor(budget, route), route));
  }
  for (const f of styles) hits.push(...lintCss(f, fs.readFileSync(f, "utf-8"), { allow, built: true }));
  process.exit(report([...pages, ...styles], hits));
}

const files = targets.length
  ? targets.flatMap((t) => walk(t, EXPLICIT_EXT))
  : walk("src", SOURCE_EXT).filter((f) => !DEFAULT_SKIP.some((s) => f === s || f.startsWith(s)));
const hits = files.flatMap((f) => lintFile(f, fs.readFileSync(f, "utf-8"), allow));
process.exit(report(files, hits));
