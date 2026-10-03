import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { type Allow, type Hit, lintClasses, lintCss, lintFile, lintText, titleCaseWords } from "./slop";

const ROOT = path.join(__dirname, "../..");
const FIX = "src/lib/__fixtures__/slop";
const read = (rel: string) => fs.readFileSync(path.join(ROOT, FIX, rel), "utf-8");

// A small allowlist written for these tests, so the expected hits below are worked out by hand
// from the fixture text rather than from the real design/slop-allow.json.
const allow: Allow = {
  acronyms: ["FCA", "LLM"],
  properNouns: ["Claude Code", "Imperial College London"],
  radius: [{ component: "Avatar.tsx", class: "rounded-full", reason: "a portrait photo is round" }],
  money: [{ texts: ["$3bn+"], reason: "a client's size, not an employer money figure" }],
};

type Pair = [rule: string, line: number];
const sorted = (pairs: Pair[]) => [...pairs].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
const pairs = (hits: Hit[]) => sorted(hits.map((h) => [h.rule, h.line]));
const lintFixture = (rel: string) => lintFile(`${FIX}/${rel}`, read(rel), allow);

// One planted file per rule family; the line numbers are counted by hand from each file.
const planted: [file: string, expected: Pair[]][] = [
  ["em-dash.mdx", [["em-dash", 7]]],
  ["marketing.mdx", [["marketing", 7], ["marketing", 9]]],
  ["heading.mdx", [["title-case", 2], ["emoji-heading", 7], ["title-case", 9], ["title-case", 13]]],
  ["exclamation.tsx", [["exclamation", 5]]],
  ["hi-im.tsx", [["hi-im", 4]]],
  ["caps.tsx", [["uppercase", 4], ["letter-spacing", 4], ["all-caps", 5], ["spaced-caps", 6]]],
  ["caps.css", [["uppercase", 2], ["letter-spacing", 3]]],
  ["radius.tsx", [["radius", 4], ["radius", 5], ["radius", 7], ["radius", 8]]],
  ["radius.css", [["radius", 2], ["radius", 10]]],
  ["filler-subtitle.tsx", [["filler-subtitle", 5]]],
  ["eyebrow.tsx", [["eyebrow", 4], ["eyebrow", 5]]],
  ["content/money.ts", [["money", 3]]],
  ["gradient.tsx", [["gradient", 4], ["blur-blob", 4], ["glass", 5]]],
  ["gradient.css", [["gradient", 2], ["purple-gradient", 2], ["blur-blob", 6], ["glass", 10]]],
  ["cards.tsx", [["three-card-grid", 4], ["card-grid", 5], ["bento", 10], ["testimonial", 13]]],
  ["icon-kit.tsx", [["icon-kit", 1]]],
  ["colour.css", [["pure-bw", 2], ["cream-default", 3], ["clay-default", 4], ["pure-bw", 5]]],
  ["font.css", [["default-font", 2], ["default-font", 6]]],
  ["font.tsx", [["default-font", 1]]],
  ["motion.css", [["motion-no-reduce", 2], ["transition-all", 2], ["overshoot", 6]]],
  [
    "motion.tsx",
    [["transition-all", 4], ["hover-scale", 4], ["motion-no-reduce", 4], ["motion-no-reduce", 5]],
  ],
];

describe("planted fixtures", () => {
  for (const [file, expected] of planted) {
    it(`${file} fails with ${[...new Set(expected.map((e) => e[0]))].join(", ")}`, () => {
      expect(pairs(lintFixture(file))).toEqual(sorted(expected));
    });
  }

  for (const file of ["clean/Clean.tsx", "clean/clean.mdx", "clean/clean.css"]) {
    it(`${file} passes`, () => {
      expect(lintFixture(file)).toEqual([]);
    });
  }

  it("reports file, line, rule, message and excerpt", () => {
    const [hit] = lintFixture("exclamation.tsx");
    expect(hit).toMatchObject({ file: `${FIX}/exclamation.tsx`, line: 5, rule: "exclamation" });
    expect(hit.message).not.toBe("");
    expect(hit.excerpt).toContain("Welcome to my site!");
  });
});

describe("lintText", () => {
  it("counts lines from the given start line", () => {
    expect(pairs(lintText("f.mdx", "one line\ntwo — three", 10))).toEqual([["em-dash", 11]]);
  });

  it("leaves en dashes, acronyms on the list and plain words alone", () => {
    expect(lintText("f.mdx", "From 2024–2026 the FCA and an LLM judge checked it.", 1, { allow })).toEqual([]);
  });

  it("flags capitals outside the acronym list but not short ones or plurals", () => {
    expect(pairs(lintText("f.mdx", "The CV and the UK sit beside LLMs and NEW", 1, { allow }))).toEqual([["all-caps", 1]]);
  });

  it("reads capitals followed by a file extension as a file name, not shouting", () => {
    expect(lintText("f.mdx", "Write a CLAUDE.md and a README.md file.", 1)).toEqual([]);
  });

  it("catches a Hi or Hello opener after a sentence too", () => {
    expect(pairs(lintText("f.mdx", "Welcome. Hi, I'm Casey.", 1))).toEqual([["hi-im", 1]]);
    expect(lintText("f.mdx", "He said hi to me.", 1)).toEqual([]);
  });

  it("only applies the money rule to content", () => {
    expect(pairs(lintText("f.ts", "Saved £1.2m.", 1, { content: true }))).toEqual([["money", 1]]);
    expect(lintText("f.ts", "Saved £1.2m.", 1, { content: false })).toEqual([]);
    expect(lintText("f.ts", "Two firms with $3bn+ in assets.", 1, { content: true, allow })).toEqual([]);
  });
});

describe("titleCaseWords", () => {
  it("names the capitalised words after the first", () => {
    expect(titleCaseWords("How We Ship Features")).toEqual(["We", "Ship", "Features"]);
  });

  it("lets month names, single-letter labels and words after a colon keep their capitals", () => {
    expect(titleCaseWords("Public prices, as of 3 October 2026")).toEqual([]);
    expect(titleCaseWords("Example A: a steady support assistant")).toEqual([]);
    expect(titleCaseWords("Example B: Two users")).toEqual([]);
  });
});

describe("lintClasses", () => {
  const rules = (classes: string) => lintClasses("src/components/X.tsx", classes, 1, allow).map((h) => h.rule);

  it("reads Tailwind variants and arbitrary values", () => {
    expect(rules("md:uppercase")).toEqual(["uppercase"]);
    expect(rules("rounded-t-xl")).toEqual(["radius"]);
    expect(rules("tracking-[0.1em]")).toEqual(["letter-spacing"]);
    expect(rules("bg-white")).toEqual(["pure-bw"]);
  });

  it("allows small radii, tight tracking and plain colours", () => {
    expect(rules("rounded rounded-sm rounded-none rounded-[4px] tracking-tight tracking-[0.02em] bg-bg text-fg")).toEqual([]);
  });

  it("allows a radius only in the component its allowlist entry names", () => {
    const img = '<img className="rounded-full" alt="" src="/me.jpg" />';
    expect(lintFile("src/components/Avatar.tsx", img, allow)).toEqual([]);
    expect(lintFile("src/components/Card.tsx", img, allow).map((h) => h.rule)).toEqual(["radius"]);
  });
});

describe("lintCss", () => {
  it("exempts print styles from the pure black and white rule", () => {
    expect(lintCss("a.css", "@media print { body { color: #000; background: #fff; } }")).toEqual([]);
  });

  it("tells the warm cream default from a neutral off-white", () => {
    const css = ":root {\n  --surface-soft: #f4f4f2;\n  --paper: #f4f1ea;\n}";
    expect(pairs(lintCss("a.css", css))).toEqual([["cream-default", 3]]);
  });

  it("follows var() to the token it names", () => {
    const css = ":root { --white: #fff; }\n.box { background-color: var(--white); }";
    expect(pairs(lintCss("a.css", css))).toEqual([["pure-bw", 1], ["pure-bw", 2]]);
  });
});

describe("lint-slop CLI", () => {
  const run = (...args: string[]) =>
    spawnSync(process.execPath, ["scripts/lint-slop.mts", ...args], { cwd: ROOT, encoding: "utf-8" });

  it("fails on the planted folder and names every planted rule", () => {
    const out = run(FIX);
    expect(out.status).toBe(1);
    const rules = new Set(planted.flatMap(([, expected]) => expected.map((e) => e[0])));
    for (const rule of rules) expect(out.stdout).toContain(` ${rule} `);
    expect(out.stdout).toMatch(/^FAIL +src\/lib\/__fixtures__\/slop\/em-dash\.mdx/m);
    expect(out.stdout).toMatch(/^pass +src\/lib\/__fixtures__\/slop\/clean\/clean\.mdx/m);
  });

  it("passes on the clean folder", () => {
    const out = run(`${FIX}/clean`);
    expect(out.stdout + out.stderr).toContain("pass");
    expect(out.status).toBe(0);
  });
});
