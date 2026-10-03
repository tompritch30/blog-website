// Slop lint CLI: runs the rules in src/lib/slop.ts over files and prints every hit.
//
//   npm run lint:slop                   scan src/ (tsx, ts, mdx, css), skipping the lint, its tests and fixtures
//   npm run lint:slop -- <path> ...     scan the given files or folders (html too)
//
// Options: --allow <file> (default design/slop-allow.json).
// Exit 0 when clean, 1 on any hit, 2 on a usage or setup problem.
// Node 22 runs this file directly (type stripping), so it imports slop.ts by its .ts name.
import fs from "node:fs";
import path from "node:path";
import { type Allow, type Hit, lintFile } from "../src/lib/slop.ts";

const SOURCE_EXT = /\.(tsx|ts|mdx|css)$/;
const EXPLICIT_EXT = /\.(tsx|ts|mts|mdx|md|css|html)$/;
const DEFAULT_SKIP = ["src/lib/slop.ts", "src/lib/slop.test.ts", "src/lib/__fixtures__/slop/"];

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

function loadAllow(file: string): Allow {
  if (!fs.existsSync(file)) fail(`allowlist not found: ${file}`);
  const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<Allow>;
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
const targets: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--allow") allowFile = args[++i] ?? fail("--allow needs a file");
  else if (args[i].startsWith("--")) fail(`unknown option ${args[i]}`);
  else targets.push(args[i]);
}

const allow = loadAllow(allowFile);
const files = targets.length
  ? targets.flatMap((t) => walk(t, EXPLICIT_EXT))
  : walk("src", SOURCE_EXT).filter((f) => !DEFAULT_SKIP.some((s) => f === s || f.startsWith(s)));
const hits = files.flatMap((f) => lintFile(f, fs.readFileSync(f, "utf-8"), allow));
process.exit(report(files, hits));
