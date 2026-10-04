import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Allow,
  type ControlEntry,
  type Hit,
  findControls,
  lintClasses,
  lintControls,
  lintCss,
  lintFile,
  lintHtml,
  lintText,
  sentenceCaseWords,
  titleCaseWords,
} from "./slop";

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
  // Words inside <Quote> are someone else's, quoted verbatim: only the prose around them is checked.
  ["quote.mdx", [["em-dash", 15]]],
  // In a built page the Quote component marks its blockquote with data-verbatim; a plain one is checked.
  ["quote.html", [["em-dash", 8]]],
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

// Owner review, 4 Oct 2026: heading case is a setting (design/slop-allow.json "headingCase"), so a
// Title Case variant can be judged beside the shipped sentence case. Title Case here is the common
// headline style: every word capitalised except the small words (articles, short conjunctions and
// prepositions), which stay lower case unless they open the heading or follow a colon.
describe("sentenceCaseWords (Title Case mode)", () => {
  it("names the words a Title Case heading leaves in lower case, small words apart", () => {
    expect(sentenceCaseWords("AI advice reports in production for wealth managers")).toEqual(["advice", "reports", "production", "wealth", "managers"]);
    expect(sentenceCaseWords("AI Advice Reports in Production for Wealth Managers")).toEqual([]);
  });

  it("names a small word capitalised in the middle, but not one that opens the heading or follows a colon", () => {
    expect(sentenceCaseWords("Cutting Costs With Prompt Caching")).toEqual(["With"]);
    expect(sentenceCaseWords("The Paper: Of Forests and Keypoints")).toEqual([]);
    expect(sentenceCaseWords("an Evaluation System")).toEqual(["an"]);
  });

  it("leaves acronyms, mixed-case names, numbers and file names alone", () => {
    expect(sentenceCaseWords("A WhatsApp Agent for 10x More LLM Calls")).toEqual([]);
    expect(sentenceCaseWords("The `CLAUDE.md` File and iOS")).toEqual([]);
    expect(sentenceCaseWords("Imperial College London in 2024", allow)).toEqual([]);
  });
});

describe("heading case setting", () => {
  const mdx = (...headings: string[]) => ['---', 'title: "A Post About Caching"', 'date: "2026-01-01"', 'description: "x"', "---", "", ...headings.map((h) => `## ${h}`)].join("\n");
  const title: Allow = { ...allow, headingCase: "title" };

  it("in sentence mode (the default) fails Title Case headings and passes sentence case", () => {
    expect(pairs(lintFile("p.mdx", mdx("What prompt caching saves", "What Prompt Caching Saves"), allow))).toEqual([["title-case", 2], ["title-case", 8]]);
  });

  it("in title mode passes Title Case headings and fails sentence-case ones", () => {
    expect(pairs(lintFile("p.mdx", mdx("What prompt caching saves", "What Prompt Caching Saves"), title))).toEqual([["sentence-case", 7]]);
  });

  it("in title mode reads the planted heading fixture the other way round", () => {
    expect(pairs(lintFile(`${FIX}/heading.mdx`, read("heading.mdx"), title))).toEqual([["emoji-heading", 7], ["sentence-case", 7]]);
  });

  it("applies to built pages too", () => {
    const html = "<main><h2>Outside work</h2><h2>Education and Research</h2></main>";
    expect(pairs(lintHtml("p.html", html, { allow: title, built: true }))).toEqual([["sentence-case", 1]]);
    expect(pairs(lintHtml("p.html", html, { allow, built: true }))).toEqual([["title-case", 1]]);
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

describe("lintHtml (built pages)", () => {
  it("lints visible text only: not head, scripts, hidden, pre, code, template, noscript or comments", () => {
    expect(pairs(lintFixture("planted.html"))).toEqual([["title-case", 8], ["em-dash", 9]]);
  });

  it("finds eyebrows, filler subtitles, class, icon and inline-style tells in markup", () => {
    expect(pairs(lintFixture("structure.html"))).toEqual(
      sorted([
        ["eyebrow", 5],
        ["filler-subtitle", 7],
        ["letter-spacing", 10],
        ["radius", 10],
        ["uppercase", 10],
        ["icon-kit", 11],
        ["pure-bw", 12],
        ["radius", 12],
      ]),
    );
  });

  it("passes a clean page whose slop sits only in head, scripts, hidden and code", () => {
    expect(lintFixture("clean/clean.html")).toEqual([]);
  });

  it("finds only the real tells on the post page as built on 3 Oct 2026", () => {
    // Counted by hand from src/content/posts/claude-code-workflow.mdx at that date: six text runs
    // with em dashes, one "unlock", and the lucide arrow icon on the back link. Code, scripts and
    // the hidden div must add nothing.
    const real = JSON.parse(fs.readFileSync(path.join(ROOT, "design/slop-allow.json"), "utf-8")) as Allow;
    const file = `${FIX}/built-regression/claude-code-workflow.html`;
    const hits = lintHtml(file, read("built-regression/claude-code-workflow.html"), { allow: real, built: true });
    const counts = Object.fromEntries([...new Set(hits.map((h) => h.rule))].map((r) => [r, hits.filter((h) => h.rule === r).length]));
    // external-link: that build's footer GitHub link, a bare <a> (the rule came on 4 Oct)
    expect(counts).toEqual({ "em-dash": 6, marketing: 1, "icon-kit": 1, "external-link": 1 });
  });

  it("finds nothing on the same post page rebuilt after the slice 4 fixes but its bare footer GitHub link, payload scripts and code included", () => {
    const real = JSON.parse(fs.readFileSync(path.join(ROOT, "design/slop-allow.json"), "utf-8")) as Allow;
    const rel = "built-regression/claude-code-workflow-after-slice-4.html";
    const hits = lintHtml(`${FIX}/${rel}`, read(rel), { allow: real, built: true });
    expect(hits.map((h) => [h.rule, h.excerpt])).toEqual([["external-link", "https://github.com/tompritch30"]]);
  });

  // The allowlist's file key names a source file, which a built page is not, so on built pages an
  // entry is matched by its text alone.
  const keyed: Allow = { ...allow, money: [{ file: "src/content/profile.ts", texts: ["£2bn+"], reason: "clients' size" }] };

  it("applies the money rule to a built page's visible text and alt text, matching the allowlist by text alone", () => {
    const hits = lintHtml(`${FIX}/built-money.html`, read("built-money.html"), { allow: keyed, built: true });
    // line 3 "$5m", line 4 "$40k" (React split it with a comment), line 5 "€6m" in an alt; not the
    // allowlisted "£2bn+" on line 2, nor the script, code, hidden or verbatim text
    expect(pairs(hits)).toEqual([["money", 3], ["money", 4], ["money", 5]]);
    expect(hits.map((h) => /"([^"]+)"/.exec(h.message)?.[1])).toEqual(["$5m", "$40k", "€6m"]);
  });

  it("leaves money in an HTML file alone unless it is a built page (source content has its own rule)", () => {
    expect(lintHtml(`${FIX}/built-money.html`, read("built-money.html"), { allow: keyed }).filter((h) => h.rule === "money")).toEqual([]);
  });

  it("fails a built off-site link without target=_blank, rel noopener noreferrer and the hidden new-tab hint", () => {
    const hits = lintHtml(`${FIX}/built-external.html`, read("built-external.html"), { allow, built: true });
    expect(pairs(hits)).toEqual([["external-link", 3], ["external-link", 4], ["external-link", 5]]);
    expect(hits.map((h) => h.message)).toEqual([
      expect.stringContaining('target="_blank"'),
      expect.stringContaining("noreferrer"),
      expect.stringContaining("(opens in a new tab)"),
    ]);
  });

  it("checks off-site links on built pages only", () => {
    expect(lintHtml(`${FIX}/built-external.html`, read("built-external.html"), { allow }).filter((h) => h.rule === "external-link")).toEqual([]);
  });
});

describe("controls budget", () => {
  const page = [
    '<body><a href="#main">Skip to content</a><nav><a href="/">Home</a><a href="/writing">Writing</a></nav>',
    '<main><div class="prose"><p><a href="https://example.com">a</a> and <a href="/b">b</a></p></div>',
    '<button type="button">Menu</button><input type="hidden" name="x"/><pre tabindex="0"><code>x</code></pre></main></body>',
  ].join("\n");
  const layout: ControlEntry[] = [
    { kind: "link", href: "#main", job: "skip the navigation" },
    { kind: "link", href: "/", job: "go home" },
    { kind: "link", href: "/writing", job: "list the posts" },
  ];

  it("counts links, buttons, inputs and focusable regions, marking links inside prose", () => {
    const found = findControls(page).map((c) => [c.kind, c.href ?? c.name, c.line, c.inProse]);
    expect(found).toEqual([
      ["link", "#main", 1, false],
      ["link", "/", 1, false],
      ["link", "/writing", 1, false],
      ["link", "https://example.com", 2, true],
      ["link", "/b", 2, true],
      ["button", "Menu", 3, false],
      ["focusable", "x", 3, false],
    ]);
  });

  it("fails each control the route's budget does not list", () => {
    const entries = [...layout, { kind: "prose links", job: "links the text cites" }];
    expect(pairs(lintControls("p.html", page, entries, "/x"))).toEqual([["control-unlisted", 3], ["control-unlisted", 3]]);
  });

  it("passes when every control is listed, prose links and scroll regions as classes", () => {
    const entries = [
      ...layout,
      { kind: "prose links", job: "links the text cites" },
      { kind: "button", name: "Menu", job: "open the menu" },
      { kind: "scroll regions", job: "wide code scrolls by keyboard" },
    ];
    expect(lintControls("p.html", page, entries, "/x")).toEqual([]);
  });

  it("fails a second control beyond an entry's count, and every control on an unbudgeted route", () => {
    const twice = '<a href="/">Home</a>\n<a href="/">Home again</a>';
    expect(pairs(lintControls("p.html", twice, [{ kind: "link", href: "/", job: "go home" }], "/x"))).toEqual([
      ["control-unlisted", 2],
      ["duplicate-href", 2],
    ]);
    expect(pairs(lintControls("p.html", twice, null, "/x"))).toEqual([
      ["control-unlisted", 1],
      ["control-unlisted", 2],
      ["duplicate-href", 2],
    ]);
  });

  it("fails an <a> without href, a link with role=button, and an entry without a job", () => {
    const html = '<a class="x">Read on</a>\n<a href="/go" role="button">Go</a>\n<button type="button">Copy</button>';
    const entries = [
      { kind: "link", href: "/go", job: "start" },
      { kind: "button", name: "Copy", job: "" },
    ];
    expect(pairs(lintControls("p.html", html, entries, "/x"))).toEqual([["a-no-href", 1], ["role-button-link", 2], ["control-no-job", 3]]);
  });
});

// Owner review, 4 Oct 2026: a page links each place once, and one label never names two places.
describe("links appear once per page", () => {
  const ext = (href: string, text: string) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer" class="link">${text}<span class="ext" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;
  const any: ControlEntry[] = [
    { kind: "link", href: "/*", count: "many", job: "any page" },
    { kind: "link", href: "#*", count: "many", job: "any anchor" },
    { kind: "link", href: "https://*", count: "many", job: "any site" },
  ];
  const rules = (html: string) => pairs(lintControls("p.html", html, any, "/x").filter((h) => h.rule.startsWith("duplicate-")));

  it("fails a second link to the same address, a trailing slash or not, but not same-page anchors or the post body", () => {
    const html = [
      '<a href="#main">Skip to content</a><nav><a href="/cv">CV</a></nav>',
      `<p>${ext("https://github.com/casey", "GitHub")} <a href="/cv/">Every role</a></p>`,
      `<div class="prose"><p>${ext("https://github.com/casey", "my code")} <a href="#fn-1">1</a> <a href="#fn-1">1</a> <a href="#main">top</a></p></div>`,
    ].join("\n");
    expect(rules(html)).toEqual([["duplicate-href", 2]]);
  });

  it("fails two links with the same visible label that lead to different places, reading only the visible text", () => {
    const html = [
      '<nav><a href="/about">About</a><a href="/writing">Writing</a></nav>',
      '<nav aria-label="On this page"><a href="#about">about</a><a href="/writing/all">All writing</a></nav>',
      `<p>${ext("https://github.com/casey", "GitHub")}</p>`,
      '<p><a href="/code" aria-label="Code on GitHub">GitHub</a></p>',
    ].join("\n");
    expect(rules(html)).toEqual([["duplicate-label", 2], ["duplicate-label", 4]]);
  });

  it("passes a page that links each place once under its own label", () => {
    const html = `<a href="#main">Skip to content</a><a href="/">Casey</a><a href="/cv">CV</a>\n<p>${ext("https://github.com/casey", "GitHub")} ${ext("https://linkedin.com/in/casey", "LinkedIn")}</p>`;
    expect(rules(html)).toEqual([]);
  });

  // Review round 2: remark-gfm draws every footnote's way back as "↩" to its own anchor, so two
  // footnotes read as one label naming two places. Same-page anchors move within the page; only an
  // anchor named like a link to another page (an "About" anchor beside the nav's About) still fails.
  it("passes a post with two GFM footnotes, as remark-gfm renders them", () => {
    const entries: ControlEntry[] = [
      { kind: "link", href: "#main", job: "skip the navigation" },
      { kind: "link", href: "/", job: "go home" },
      { kind: "link", href: "/writing", job: "list the posts" },
      { kind: "prose links", job: "links the post cites" },
    ];
    expect(pairs(lintControls("footnotes.html", read("footnotes.html"), entries, "/writing/[slug]"))).toEqual([]);
  });

  it("compares addresses without query or fragment, scheme, www. or a trailing slash, and reads the page's own origin as a path", () => {
    expect(rules(read("duplicate-href.html"))).toEqual([
      ["duplicate-href", 2],
      ["duplicate-href", 3],
      ["duplicate-href", 5],
      ["duplicate-href", 6],
      ["duplicate-href", 9],
    ]);
  });

  it("resolves the site's own origin from an option when the page has no canonical link", () => {
    const html = '<a href="/cv">CV</a>\n<a href="https://casey.example/cv/">My CV</a>';
    expect(pairs(lintControls("p.html", html, any, "/x"))).toEqual([]);
    expect(pairs(lintControls("p.html", html, any, "/x", { origins: ["https://casey.example"] }))).toEqual([["duplicate-href", 2]]);
  });

  it("lets a post's body cite one source twice, but not the page chrome", () => {
    const html = [
      '<nav><a href="/">Casey</a><a href="/cv">CV</a></nav>',
      `<div class="prose"><p>${ext("https://example.com/paper", "the paper")} and later ${ext("https://example.com/paper", "the same paper")} and <a href="/cv">CV</a></p></div>`,
      '<p><a href="/cv">CV</a></p>',
    ].join("\n");
    expect(rules(html)).toEqual([["duplicate-href", 3]]);
  });
});

// Each test starts a Node process; under the parallel pre-commit hook that can take several seconds.
describe("lint-slop CLI", { timeout: 30_000 }, () => {
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

  it("--built fails each planted control page and the planted CSS", () => {
    const dir = `${FIX}/built-planted`;
    const out = run("--built", dir, "--controls", `${dir}/CONTROLS.json`);
    expect(out.status).toBe(1);
    const app = `${dir}/server/app`;
    expect(out.stdout).toContain(`${app}/unlisted.html:3 control-unlisted `);
    expect(out.stdout).toContain(`${app}/no-href.html:3 a-no-href `);
    expect(out.stdout).toContain(`${app}/role-button.html:3 role-button-link `);
    expect(out.stdout).toContain(`${app}/no-job.html:3 control-no-job `);
    expect(out.stdout).toContain(`${dir}/static/chunks/site.css:1 radius `);
    // the real allowlist: "$2.50" passes by its text, the split "$75k" does not
    expect(out.stdout).toContain(`${app}/money.html:3 money currency figure "$75k"`);
    expect(out.stdout).toContain(`${app}/external.html:3 external-link `);
    expect(out.stdout).toContain(`${app}/duplicate.html:2 duplicate-href `);
    expect(out.stdout).toContain(`${app}/duplicate.html:3 duplicate-label `);
    expect(out.stdout.match(/^\S+:\d+ /gm)).toHaveLength(9);
  });

  it("--built passes a clean build, vendored CSS selectors included", () => {
    const dir = `${FIX}/built-clean`;
    const out = run("--built", dir, "--controls", `${dir}/CONTROLS.json`);
    expect(out.stdout).toMatch(/^pass +\S+\/writing\/a-post\.html/m);
    expect(out.status).toBe(0);
  });

  it("--built skips Next's own static 500 page, which global-error.tsx cannot replace, and says so", () => {
    const dir = `${FIX}/built-clean`;
    const out = run("--built", dir, "--controls", `${dir}/CONTROLS.json`);
    expect(out.stdout).toMatch(/^skip +\S+\/server\/app\/_global-error\.html +Next's built-in static 500 page/m);
    expect(out.status).toBe(0);
  });

  it("refuses an allowlist whose headingCase is neither sentence nor title", () => {
    const out = run(`${FIX}/clean`, "--allow", `${FIX}/allow-bad-case.json`);
    expect(out.status).toBe(2);
    expect(out.stderr).toContain('headingCase must be "sentence" or "title"');
  });

  it("--built with no build output exits 2 and says so", () => {
    const out = run("--built", `${FIX}/no-such-build`);
    expect(out.status).toBe(2);
    expect(out.stderr).toContain("no build output");
  });
});
