// Slop lint: pure rule functions that find the tells of generated design and generated copy.
//
// Ported from Hazel's design/lint/slop.mjs (Thomas Pritchard's own code, MIT): its colour maths,
// filler words, text rules and CSS declaration rules. Added for this site: the owner's anti-slop
// list and the rules in plans/site-v2.md (slice 3 and its grill log), whose sources are hallmark's
// slop-test.md and anti-patterns.md. TS and TSX are read with the TypeScript parser (already a dev
// dependency) so JSX text, class names and plain strings are told apart without regex guesswork.
// No file system access here: scripts/lint-slop.mts reads the files and the allowlist.
import ts from "typescript";

export type Hit = { file: string; line: number; rule: string; message: string; excerpt: string };
export type RadiusAllow = { component: string; class?: string; reason: string };
export type MoneyAllow = { file?: string; texts: string[]; reason: string };
export type HeadingCase = "sentence" | "title";
export type Allow = { acronyms: string[]; properNouns: string[]; radius: RadiusAllow[]; money: MoneyAllow[]; headingCase?: HeadingCase };
export type TextOptions = { allow?: Allow; content?: boolean; where?: string };
export type CssOptions = { allow?: Allow; built?: boolean; line?: number };

export const NO_ALLOW: Allow = { acronyms: [], properNouns: [], radius: [], money: [] };

// ---------- shared helpers ----------

// Characters are built from code points so this file stays plain ASCII.
const ch = (...cps: number[]) => String.fromCodePoint(...cps);
const EM = ch(0x2014);

function hit(file: string, line: number, rule: string, message: string, excerpt = ""): Hit {
  return { file, line, rule, message, excerpt: excerpt.replace(/\s+/g, " ").trim().slice(0, 90) };
}

function lineFinder(src: string): (index: number) => number {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

const ENTITIES: Record<string, number> = {
  amp: 0x26, apos: 0x27, quot: 0x22, lt: 0x3c, gt: 0x3e, nbsp: 0x20, mdash: 0x2014, ndash: 0x2013, hellip: 0x2026,
  rarr: 0x2192, raquo: 0xbb, middot: 0xb7, bull: 0x2022, ldquo: 0x201c, rdquo: 0x201d, lsquo: 0x2018, rsquo: 0x2019,
  pound: 0xa3, euro: 0x20ac, copy: 0xa9,
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === "#") return ch(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    const cp = ENTITIES[e.toLowerCase()];
    return cp ? ch(cp) : all;
  });
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function sortHits(hits: Hit[]): Hit[] {
  const seen = new Set<string>();
  return hits
    .filter((h) => {
      const key = `${h.file}:${h.line}:${h.rule}:${h.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
}

// ---------- text rules ----------

// Hazel's filler list, less "harness" (a test harness is a real thing) plus a few common hero words.
const MARKETING = [
  "seamless", "seamlessly", "unlock", "unlocks", "unlocking", "elevate", "elevates", "supercharge", "supercharged",
  "empower", "empowers", "revolutionize", "revolutionise", "revolutionary", "game-changer", "game-changing",
  "cutting-edge", "leverage", "leverages", "effortless", "effortlessly", "streamline", "streamlines", "next-level",
  "world-class", "best-in-class", "delve", "delves", "unleash", "skyrocket", "turbocharge", "all-in-one", "ai-powered",
  "powered by ai", "magic", "magical", "robust", "in today's", "take your", "to the next level", "boost your",
  "transform your", "reimagine", "reimagined", "synergy", "innovative", "groundbreaking", "state-of-the-art",
  "blazing-fast", "passionate", "transformative",
];
const MARKETING_RE = MARKETING.map((w) => ({ w, re: new RegExp(`(^|[^a-z-])${escapeRe(w)}($|[^a-z-])`) }));
// Capitals followed by a file extension (README.md, CLAUDE.md) are file names, not shouting.
const CAPS_RE = /(?<![\p{L}\p{N}_.\-/])[A-Z]{3,}(?![\p{L}\p{N}_]|\.[a-z]{1,4}\b)/gu;
const SPACED_CAPS_RE = /(?<!\p{L})[A-Z](?: [A-Z]){3,}(?!\p{L})/u;
const HI_IM_RE = /(^|[.!?]\s+)(hi|hello|hey)\s*[,!]?\s+(i['’]m|i am|my name is)\b/i;
const EXCLAIM_RE = /!(?=\s|$|["'”’)\]*_])/;
const MONEY_RE = /[£$€]\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:bn|m|k|billion|million|thousand)\b)?\+?/g;

// byText: match allowlist entries by their text alone. A built page is not the source file an
// entry's `file` names, so built pages use this.
function moneyHits(file: string, text: string, line: number, allow: Allow, byText = false): Hit[] {
  const lineOf = lineFinder(text);
  const out: Hit[] = [];
  for (const m of text.matchAll(MONEY_RE)) {
    const token = m[0].trim();
    const allowed = allow.money.some((e) => (byText || !e.file || file.endsWith(e.file)) && e.texts.includes(token));
    if (!allowed) {
      const at = line + lineOf(m.index) - 1;
      const lineText = text.split("\n")[lineOf(m.index) - 1];
      out.push(hit(file, at, "money", `currency figure "${token}" in content is not on the money allowlist`, lineText));
    }
  }
  return out;
}

/** Prose rules on one block of visible text. `line` is the line of the text's first character. */
export function lintText(file: string, text: string, line: number, opts: TextOptions = {}): Hit[] {
  const allow = opts.allow ?? NO_ALLOW;
  const where = opts.where ?? "prose";
  const acronyms = new Set(allow.acronyms.map((a) => a.toUpperCase()));
  const out: Hit[] = [];
  text.split("\n").forEach((raw, i) => {
    const t = decodeEntities(raw).replace(/’/g, "'");
    if (!t.trim()) return;
    const at = line + i;
    if (t.includes(EM)) out.push(hit(file, at, "em-dash", `em dash in ${where}; use a comma, colon or full stop`, t));
    const lower = t.toLowerCase();
    for (const { w, re } of MARKETING_RE) if (re.test(lower)) out.push(hit(file, at, "marketing", `marketing word "${w}"`, t));
    if (EXCLAIM_RE.test(t)) out.push(hit(file, at, "exclamation", `exclamation mark in ${where}`, t));
    if (HI_IM_RE.test(t)) out.push(hit(file, at, "hi-im", `"Hi, I'm" opener`, t));
    const caps = [...t.matchAll(CAPS_RE)].map((m) => m[0]).filter((w) => !acronyms.has(w));
    if (caps.length) out.push(hit(file, at, "all-caps", `all-caps ${caps.join(", ")} (not on the acronym list)`, t));
    if (SPACED_CAPS_RE.test(t)) out.push(hit(file, at, "spaced-caps", "letter-spaced capitals", t));
  });
  if (opts.content) out.push(...moneyHits(file, text, line, allow));
  return out;
}

// ---------- heading rules ----------

const EMOJI_RE = new RegExp(`(?![${ch(0xa9, 0xae, 0x2122)}])\\p{Extended_Pictographic}`, "u");
const TESTIMONIAL_HEADING_RE = /^(testimonials?|kind words|what (people|clients|customers|colleagues) (say|said))\b/i;

const CALENDAR_RE =
  /^(January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;

/** Words after the first that are capitalised but are not proper nouns, acronyms or "I". */
export function titleCaseWords(text: string, allow: Allow = NO_ALLOW): string[] {
  let t = text;
  for (const noun of [...allow.properNouns].sort((a, b) => b.length - a.length)) {
    t = t.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(noun)}(?![\\p{L}\\p{N}])`, "gu"), " ");
  }
  const titled: string[] = [];
  let sentenceStart = true;
  for (const raw of t.split(/\s+/)) {
    const w = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (!w) continue;
    const first = sentenceStart;
    sentenceStart = /[:.?!]$/.test(raw);
    if (first || !/^\p{Lu}/u.test(w)) continue;
    // "I", single-letter labels ("Example A") and calendar names keep their capitals in sentence case.
    if (w.length === 1 || /^I'/.test(w.replace(/’/g, "'")) || CALENDAR_RE.test(w)) continue;
    if (w.length >= 2 && w === w.toUpperCase()) continue;
    if (/\p{Lu}/u.test(w.slice(1)) || /\d/.test(w)) continue;
    titled.push(w);
  }
  return titled;
}

// Title Case's small words: articles, short conjunctions and short prepositions, lower case unless
// they open the heading or follow a colon (the common headline style).
const SMALL_WORDS = new Set(["a", "an", "the", "and", "but", "or", "nor", "for", "so", "yet", "as", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via", "vs", "with", "from", "into"]);

/**
 * For headingCase "title": the words a Title Case heading gets wrong. A word that opens the heading or
 * follows a colon must be capitalised; any other word must be capitalised unless it is a small word,
 * and a small word there must be lower case. Words with a capital after the first letter (acronyms,
 * WhatsApp, iOS), digits or no leading letter are left alone, as are proper nouns on the allowlist.
 */
export function sentenceCaseWords(text: string, allow: Allow = NO_ALLOW): string[] {
  // A proper noun becomes a capitalised stand-in, so the word after it never reads as the opening one.
  let t = text;
  for (const noun of [...allow.properNouns].sort((a, b) => b.length - a.length)) {
    t = t.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(noun)}(?![\\p{L}\\p{N}])`, "gu"), " Proper ");
  }
  const wrong: string[] = [];
  let opening = true;
  for (const raw of t.split(/\s+/)) {
    if (!raw) continue;
    const w = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    const first = opening;
    opening = /:$/.test(raw);
    if (!w || !/^\p{L}/u.test(w) || /\d/.test(w) || /\p{Lu}/u.test(w.slice(1)) || raw.includes("`")) continue;
    const upper = /^\p{Lu}/u.test(w);
    if (first) {
      if (!upper) wrong.push(w);
    } else if (SMALL_WORDS.has(w.toLowerCase())) {
      if (upper) wrong.push(w);
    } else if (!upper) wrong.push(w);
  }
  return wrong;
}

function headingHits(file: string, text: string, line: number, allow: Allow): Hit[] {
  const out: Hit[] = [];
  const t = decodeEntities(text).replace(/\s+/g, " ").trim();
  if (!t) return out;
  if (EMOJI_RE.test(t)) out.push(hit(file, line, "emoji-heading", "emoji in a heading", t));
  if (allow.headingCase === "title") {
    const wrong = sentenceCaseWords(t, allow);
    if (wrong.length) out.push(hit(file, line, "sentence-case", `heading not in Title Case (${wrong.join(", ")}); headingCase is "title"`, t));
  } else {
    const titled = titleCaseWords(t, allow);
    if (titled.length) {
      out.push(hit(file, line, "title-case", `Title Case heading (${titled.join(", ")}); use sentence case`, t));
    }
  }
  if (TESTIMONIAL_HEADING_RE.test(t)) out.push(hit(file, line, "testimonial", "testimonial section", t));
  return out;
}

// ---------- class rules (Tailwind) ----------

const MUTED_RE = /^(text-(secondary|muted|subtle|faint|gray|grey|zinc|neutral|slate|stone)(-\d+)?(\/\d+)?|text-fg\/\d+|opacity-\d+)$/;
const ICON_CLASS_RE = /^(lucide|lucide-.+|heroicon.*|tabler-icon.*)$/;

function splitVariants(token: string): { variants: string[]; base: string } {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const c of token) {
    if (c === "[" || c === "(") depth++;
    if (c === "]" || c === ")") depth--;
    if (c === ":" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += c;
  }
  const base = cur.replace(/^!|!$/g, "");
  return { variants: parts, base };
}

function lengthPx(value: string): number | null {
  const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * (m[2] === "rem" || m[2] === "em" ? 16 : 1);
}

function emValue(value: string): number {
  const m = /^(-?[\d.]+)(em|rem|px)?$/.exec(value.trim());
  if (!m) return 0;
  return m[2] === "px" ? Number(m[1]) / 16 : Number(m[1]);
}

const basename = (file: string) => file.split("/").pop() ?? file;

function componentMatches(file: string, component: string): boolean {
  const name = basename(file);
  return file === component || file.endsWith(`/${component}`) || name === component || name.replace(/\.[^.]+$/, "") === component;
}

function radiusAllowed(file: string, token: string, allow: Allow, built: boolean): boolean {
  const base = splitVariants(token).base;
  return allow.radius.some((e) =>
    built ? e.class === token || e.class === base : componentMatches(file, e.component) && (!e.class || e.class === token || e.class === base),
  );
}

export function isMuted(classes: string): boolean {
  return classes.split(/\s+/).some((t) => MUTED_RE.test(t));
}

/** Tailwind class tells in one class string (one element's classes). */
export function lintClasses(file: string, classes: string, line: number, allow: Allow = NO_ALLOW, built = false): Hit[] {
  const out: Hit[] = [];
  const tokens = classes.split(/\s+/).filter(Boolean);
  const flag = (rule: string, message: string, token: string) => out.push(hit(file, line, rule, message, token));
  let moving = "";
  let reduced = false;
  for (const token of tokens) {
    const { variants, base } = splitVariants(token);
    if (variants.some((v) => v === "motion-reduce" || v === "motion-safe")) reduced = true;
    if (base === "uppercase") flag("uppercase", "uppercase class: letter-spaced caps label", token);
    const tracking = /^tracking-(wide|wider|widest|\[(.+)\])$/.exec(base);
    if (tracking && (!tracking[2] || emValue(tracking[2]) >= 0.05)) flag("letter-spacing", "tracked-out letter spacing", token);
    const rounded = /^-?rounded(?:-(?:t|r|b|l|s|e|x|y|tl|tr|br|bl|ss|se|es|ee))?(?:-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|full|\[(.+)\]))?$/.exec(base);
    if (rounded && rounded[1]) {
      const px = rounded[2] ? lengthPx(rounded[2]) : null;
      const big = rounded[2] ? px === null || px > 4 : !["none", "xs", "sm"].includes(rounded[1]);
      if (big && !radiusAllowed(file, token, allow, built)) flag("radius", "radius over 4px outside the radius allowlist", token);
    }
    if (/^bg-(gradient-to-|linear-|radial|conic)/.test(base)) flag("gradient", "gradient background", token);
    const blur = /^blur-(2xl|3xl|\[(.+)\])$/.exec(base);
    if (blur && (!blur[2] || (lengthPx(blur[2]) ?? 0) >= 24)) flag("blur-blob", "heavy blur: the blurred blob", token);
    if (/^backdrop-/.test(base)) flag("glass", "backdrop blur or filter: glassmorphism", token);
    if (/^(eyebrow|kicker|overline|pretitle|supertitle)$/.test(base)) flag("eyebrow", "eyebrow label class", token);
    if (base === "transition-all") flag("transition-all", "transition on all properties", token);
    const bezier = /^ease-\[cubic-bezier\((.+)\)\]$/.exec(base);
    if (bezier && overshoots(bezier[1].replace(/_/g, " "))) flag("overshoot", "bounce or overshoot easing", token);
    const scale = /^scale-(\d+)$/.exec(base);
    if (scale && Number(scale[1]) > 100 && variants.some((v) => /hover$/.test(v))) flag("hover-scale", "hover grows the element", token);
    if (/^(animate-(?!none$)|transition(-|$))/.test(base) && base !== "transition-none") moving ||= token;
    if (/^(bg|from|via|to)-(white|black)(\/\d+)?$/.test(base)) flag("pure-bw", "pure white or black surface", token);
    if (/testimonial/.test(base)) flag("testimonial", "testimonial markup", token);
    if (ICON_CLASS_RE.test(base)) flag("icon-kit", "icon kit glyph", token);
  }
  if (moving && !reduced) flag("motion-no-reduce", "motion without a motion-reduce or motion-safe variant", moving);
  return out;
}

type ClassToken = { token: string; line: number };

/** Rules that need every class on a page or in a file at once. */
function classAggregateHits(file: string, tokens: ClassToken[]): Hit[] {
  const out: Hit[] = [];
  const bases = tokens.map((t) => ({ ...t, base: splitVariants(t.token).base }));
  const cards = bases.filter((t) => /(^|-)cards?($|-)/.test(t.base));
  if (cards.length >= 3) out.push(hit(file, cards[0].line, "card-grid", `${cards.length} card blocks: the card kit`, cards[0].token));
  const three = bases.find((t) => t.base === "grid-cols-3");
  const bordered = bases.some((t) => /^(border(-\d+)?|ring(-\d+)?|shadow(-\w+)?)$/.test(t.base));
  if (three && bordered) out.push(hit(file, three.line, "three-card-grid", "three-column grid of bordered boxes", three.token));
  const row = bases.find((t) => /^row-span-/.test(t.base));
  if (row && bases.some((t) => /^col-span-/.test(t.base))) out.push(hit(file, row.line, "bento", "row-span and col-span mix: bento grid", row.token));
  return out;
}

// ---------- CSS rules ----------

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function oklchToRgb(L: number, C: number, H: number): number[] {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((x) => Math.round(255 * clamp01(x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)));
}

function hslToRgb(h: number, s: number, l: number): number[] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((x) => Math.round(255 * x));
}

function rgbToHsl([r, g, b]: number[]): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

const num = (v: string, scale = 1) => (v.trim().endsWith("%") ? (parseFloat(v) / 100) * scale : parseFloat(v));

/** Opaque colours in a CSS value, as RGB; fully transparent ones are skipped. */
function colours(value: string): number[][] {
  const out: number[][] = [];
  const re = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\(([^)]*)\)|hsla?\(([^)]*)\)|oklch\(([^)]*)\)|(?<![\w-])(white|black)(?![\w-])/gi;
  for (const m of value.matchAll(re)) {
    let rgb: number[];
    let alpha = 1;
    if (m[1]) {
      let h = m[1];
      if (h.length <= 4) h = [...h].map((c) => c + c).join("");
      rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
      if (h.length === 8) alpha = parseInt(h.slice(6, 8), 16) / 255;
    } else if (m[2]) {
      const p = m[2].split(/[\s,/]+/).filter(Boolean);
      rgb = p.slice(0, 3).map((v) => (v.endsWith("%") ? num(v, 255) : +v));
      if (p[3] !== undefined) alpha = num(p[3]);
    } else if (m[3]) {
      const p = m[3].split(/[\s,/]+/).filter(Boolean);
      rgb = hslToRgb(parseFloat(p[0]), num(p[1]), num(p[2]));
      if (p[3] !== undefined) alpha = num(p[3]);
    } else if (m[4]) {
      const p = m[4].split(/[\s/]+/).filter(Boolean);
      if (p.length < 3 || p.slice(0, 3).some((x) => isNaN(parseFloat(x)))) continue;
      rgb = oklchToRgb(num(p[0]), parseFloat(p[1]), parseFloat(p[2]));
      if (p[3] !== undefined) alpha = num(p[3]);
    } else rgb = m[5].toLowerCase() === "white" ? [255, 255, 255] : [0, 0, 0];
    if (alpha > 0 && rgb.every((x) => !isNaN(x))) out.push(rgb);
  }
  return out;
}

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function overshoots(args: string): boolean {
  const p = args.split(",").map((x) => parseFloat(x));
  return p.length === 4 && (p[1] < 0 || p[1] > 1 || p[3] < 0 || p[3] > 1);
}

const BANNED_FONTS = ["inter", "roboto", "open sans", "poppins", "lato", "montserrat", "arial", "helvetica"];
const BANNED_ANYWHERE = ["space grotesk", "instrument serif"];
const COLOUR_PROPS = /^(color|background(-color|-image)?|border(-(top|right|bottom|left|block|inline)(-start|-end)?)?(-color)?|outline(-color)?|fill|stroke|text-decoration(-color)?|caret-color|accent-color|column-rule(-color)?)$/;
const SURFACE_PROP = /^(background(-color)?|--[\w-]*(bg|background|surface|paper|canvas|page)[\w-]*)$/;
const VENDORED_SELECTOR = /\.prose\b|:where\(|::backdrop/;

type Decl = { prop: string; value: string; line: number; selector: string; at: string[] };

function parseCss(css: string, baseLine: number): Decl[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const lineOf = lineFinder(clean);
  const decls: Decl[] = [];
  const stack: string[] = [];
  const context = () => ({
    selector: stack.filter((p) => !p.startsWith("@")).join(" "),
    at: stack.filter((p) => p.startsWith("@")),
  });
  const take = (segment: string, offset: number) => {
    let pos = 0;
    for (const part of segment.split(";")) {
      const i = part.indexOf(":");
      const prop = part.slice(0, i).trim().toLowerCase();
      if (i > 0 && /^(--[\w-]+|-?[a-z][a-z-]*)$/.test(prop)) {
        const at = offset + pos + part.search(/\S/);
        decls.push({ prop, value: part.slice(i + 1).trim(), line: baseLine + lineOf(at) - 1, ...context() });
      }
      pos += part.length + 1;
    }
  };
  let segStart = 0;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (c === "{") {
      const seg = clean.slice(segStart, i);
      const cut = seg.lastIndexOf(";");
      if (cut >= 0) take(seg.slice(0, cut + 1), segStart);
      stack.push(seg.slice(cut + 1).trim());
      segStart = i + 1;
    } else if (c === "}") {
      take(clean.slice(segStart, i), segStart);
      stack.pop();
      segStart = i + 1;
    }
  }
  return decls;
}

function resolver(decls: Decl[]): (v: string) => string {
  const vars = new Map<string, string>();
  for (const d of decls) if (d.prop.startsWith("--")) vars.set(d.prop, d.value);
  const re = /var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\))?[^()]*))?\)/g;
  const resolve = (v: string, depth = 0): string =>
    depth > 12 ? v : v.replace(re, (all, n: string, fb?: string) => resolve(vars.get(n) ?? fb ?? all, depth + 1));
  return resolve;
}

function firstFamily(value: string, resolve: (v: string) => string): string {
  const first = value.split(",")[0].trim();
  const v = /^var\(\s*--font-([\w-]+)/.exec(first);
  if (v) {
    const resolved = resolve(first);
    return resolved === first ? v[1].replace(/-/g, " ") : firstFamily(resolved, resolve);
  }
  return first.replace(/["']/g, "").trim().toLowerCase();
}

function declHits(file: string, d: Decl, resolve: (v: string) => string, allow: Allow, built: boolean): Hit[] {
  const out: Hit[] = [];
  const v = resolve(d.value);
  const lv = v.toLowerCase();
  const show = `${d.prop}: ${d.value}`;
  const flag = (rule: string, message: string) => out.push(hit(file, d.line, rule, message, show));
  const print = d.at.some((a) => /print/.test(a));

  if (d.prop === "text-transform" && /uppercase/.test(lv)) flag("uppercase", "uppercase text transform");
  if (d.prop === "letter-spacing" && emValue(lv) >= 0.05) flag("letter-spacing", "tracked-out letter spacing");
  if (/radius/.test(d.prop)) {
    const big = /infinity/.test(lv) || [...lv.matchAll(/(-?[\d.]+)(px|rem|em|%)/g)].some((m) => (m[2] === "%" ? +m[1] > 0 : (lengthPx(m[1] + m[2]) ?? 0) > 4));
    const allowed = allow.radius.some((e) =>
      built ? !!e.class && d.selector.includes(e.class) : componentMatches(file, e.component) && (!e.class || d.selector.includes(e.class)),
    );
    if (big && !allowed) flag("radius", "radius over 4px outside the radius allowlist");
  }
  if (/gradient\(/.test(lv)) {
    flag("gradient", "gradient background");
    const purple = colours(v).some((rgb) => {
      const { h, s, l } = rgbToHsl(rgb);
      return h >= 255 && h <= 335 && s > 0.25 && l > 0.12 && l < 0.92;
    });
    if (purple) flag("purple-gradient", "purple, violet or magenta in a gradient");
  }
  if (d.prop === "filter") {
    const blur = /blur\(\s*([\d.]+(?:px|rem|em))\s*\)/.exec(lv);
    if (blur && (lengthPx(blur[1]) ?? 0) >= 24) flag("blur-blob", "heavy blur: the blurred blob");
  }
  if (/^(-webkit-)?backdrop-filter$/.test(d.prop) && lv !== "none") flag("glass", "backdrop filter: glassmorphism");

  if (COLOUR_PROPS.test(d.prop) || d.prop.startsWith("--")) {
    for (const rgb of colours(v)) {
      const [r, g, b] = rgb;
      const pure = (r === 255 && g === 255 && b === 255) || (r === 0 && g === 0 && b === 0);
      if (pure && !print) flag("pure-bw", `pure ${r ? "white" : "black"}`);
      else if (!pure && r === g && g === b && r <= 20) flag("near-black", "neutral near-black standing in for black");
      // Cream is a warm tint (red above blue); a neutral off-white near it is not the tell.
      if (SURFACE_PROP.test(d.prop) && dist(rgb, [244, 241, 234]) < 10 && r - b >= 6) flag("cream-default", "the generated-design cream base");
      if (dist(rgb, [217, 119, 87]) < 28) flag("clay-default", "the generated-design clay accent");
      const { h, s, l } = rgbToHsl(rgb);
      if (h >= 70 && h <= 150 && s > 0.75 && l > 0.45 && l < 0.7) flag("acid-accent", "acid green accent");
    }
  }

  const fontProp = d.prop === "font-family" || /^--([\w-]*-)?font(-[\w-]+)?$/.test(d.prop);
  if (fontProp && !d.at.some((a) => /^@font-face/.test(a))) {
    const first = firstFamily(d.value, resolve);
    if (BANNED_FONTS.includes(first)) flag("default-font", `default face "${first}" leads the stack`);
    for (const f of BANNED_ANYWHERE) if (lv.includes(f)) flag("default-font", `"${f}" is a generated-design default`);
  }

  const transition = d.prop === "transition" || d.prop === "transition-property";
  if (transition && /(^|[\s,])all(\s|,|$)/.test(lv)) flag("transition-all", "transition on all properties");
  if (transition && /(^|[\s,])(width|height|top|left|right|bottom|margin|padding)(\s|,|$)/.test(lv)) flag("layout-motion", "animating a layout property");
  if (/^(transition|animation)(-timing-function)?$/.test(d.prop) && /(^|[\s,])ease(\s|,|$)/.test(lv)) flag("default-ease", "browser default easing");
  for (const cb of lv.matchAll(/cubic-bezier\(([^)]*)\)/g)) if (overshoots(cb[1])) flag("overshoot", "bounce or overshoot easing");
  if (/:hover/.test(d.selector) && ((d.prop === "transform" && /scale\(\s*1\.\d*[1-9]/.test(lv)) || (d.prop === "scale" && parseFloat(lv) > 1))) {
    flag("hover-scale", "hover grows the element");
  }
  return out;
}

const isMotion = (d: Decl) =>
  /^(transition|transition-property|animation|animation-name)$/.test(d.prop) && !/^(none|0s?|initial|unset)$/.test(d.value.trim().toLowerCase());

/** CSS rules: one stylesheet, a <style> block or an inline style (`x{...}`). */
export function lintCss(file: string, css: string, opts: CssOptions = {}): Hit[] {
  const allow = opts.allow ?? NO_ALLOW;
  const built = opts.built ?? false;
  const decls = parseCss(css, opts.line ?? 1);
  const resolve = resolver(decls);
  const out: Hit[] = [];
  for (const d of decls) {
    if (built && VENDORED_SELECTOR.test(d.selector)) continue;
    out.push(...declHits(file, d, resolve, allow, built));
  }
  if (!/prefers-reduced-motion/.test(css)) {
    const first = decls.find(isMotion);
    const keyframes = /@keyframes/.exec(css);
    if (first) out.push(hit(file, first.line, "motion-no-reduce", "motion without a prefers-reduced-motion path", `${first.prop}: ${first.value}`));
    else if (keyframes) out.push(hit(file, lineFinder(css)(keyframes.index) + (opts.line ?? 1) - 1, "motion-no-reduce", "keyframes without a prefers-reduced-motion path", "@keyframes"));
  }
  return out;
}

// ---------- TS and TSX ----------

const ICON_KITS = /^(lucide-react|lucide|react-icons(\/.*)?|@heroicons\/.*|@phosphor-icons\/.*|phosphor-react|@tabler\/icons(-react)?|react-feather|@fortawesome\/.*|@radix-ui\/react-icons|@mui\/icons-material(\/.*)?|iconoir-react|@iconify\/react|react-bootstrap-icons|@remixicon\/react)$/;
const TEXT_ATTRS = new Set(["alt", "title", "placeholder", "aria-label", "aria-description", "label"]);
const NO_TEXT_TAGS = new Set(["code", "pre", "script", "style", "kbd", "samp"]);
const LABEL_TAGS = new Set(["p", "span", "div", "small", "strong", "b"]);
const MONTH_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i;

function isClassLike(text: string): boolean {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.some((t) => !/^[!-]?[a-z0-9@[\]/:.\-_%#()&>=*,'"!+~]+$/.test(t))) return false;
  const marked = tokens.filter((t) => /[-:[/]|\d/.test(t)).length;
  return tokens.length === 1 ? marked === 1 : marked * 2 >= tokens.length;
}

const isProse = (text: string) => (text.match(/\p{L}{2,}/gu) ?? []).length >= 2 && /\s/.test(text.trim());

function tagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
  return (ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName).getText();
}

function attrsOf(node: ts.JsxElement | ts.JsxSelfClosingElement): ts.JsxAttributes {
  return ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;
}

function staticClass(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
  for (const a of attrsOf(node).properties) {
    if (ts.isJsxAttribute(a) && ["className", "class"].includes(a.name.getText()) && a.initializer && ts.isStringLiteral(a.initializer)) {
      return a.initializer.text;
    }
  }
  return "";
}

type Literal = { text: string; hasLink: boolean; hasTime: boolean };

/** The element's text if it is all literal JSX text (no expressions), else null. */
function literalText(node: ts.JsxElement | ts.JsxSelfClosingElement): Literal | null {
  if (ts.isJsxSelfClosingElement(node)) return { text: "", hasLink: false, hasTime: false };
  const acc: Literal = { text: "", hasLink: false, hasTime: false };
  for (const child of node.children) {
    if (ts.isJsxText(child)) acc.text += child.text;
    else if (ts.isJsxExpression(child)) {
      if (child.expression) return null;
    } else if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      const tag = tagName(child);
      if (tag === "a" || tag === "Link") acc.hasLink = true;
      if (tag === "time") acc.hasTime = true;
      if (NO_TEXT_TAGS.has(tag) || tag === "cite") continue;
      const inner = literalText(child);
      if (!inner) return null;
      acc.text += ` ${inner.text}`;
      acc.hasLink ||= inner.hasLink;
      acc.hasTime ||= inner.hasTime;
    }
  }
  acc.text = decodeEntities(acc.text).replace(/\s+/g, " ").trim();
  return acc;
}

/** A short label directly above a heading: the eyebrow. */
export function isEyebrowLabel(tag: string, text: string, hasLink: boolean): boolean {
  if (!LABEL_TAGS.has(tag) || hasLink || !text || /\d/.test(text)) return false;
  return text.length <= 40 && text.split(/\s+/).length <= 4;
}

/** A short muted line directly under an h2 or h3 with no number, date or link: the filler subtitle. */
export function isFillerSubtitle(classes: string, text: string, hasLink: boolean, hasTime: boolean): boolean {
  if (!isMuted(classes) || hasLink || hasTime || !text || /\d/.test(text) || MONTH_RE.test(text)) return false;
  return text.split(/\s+/).length <= 14;
}

function lintScript(file: string, src: string, allow: Allow): Hit[] {
  const kind = /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  const lineOf = (pos: number) => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const out: Hit[] = [];
  const tokens: ClassToken[] = [];
  const consumed = new Set<ts.Node>();

  const classString = (text: string, line: number) => {
    out.push(...lintClasses(file, text, line, allow));
    for (const token of text.split(/\s+/).filter(Boolean)) tokens.push({ token, line });
  };

  // Every string piece under a node, marking each as handled so the generic pass skips it.
  const strings = (node: ts.Node): string[] => {
    const acc: string[] = [];
    const walk = (n: ts.Node) => {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
        acc.push(n.text);
        consumed.add(n);
      } else if (ts.isTemplateExpression(n)) {
        acc.push(n.head.text, ...n.templateSpans.map((s) => s.literal.text));
        consumed.add(n);
        n.templateSpans.forEach((s) => walk(s.expression));
      } else ts.forEachChild(n, walk);
    };
    walk(node);
    return acc;
  };

  const styleObject = (obj: ts.ObjectLiteralExpression) => {
    for (const p of obj.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const name = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : "";
      const prop = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      const init = p.initializer;
      let value: string | null = null;
      if (ts.isNumericLiteral(init)) value = /radius|spacing|width|height|size|margin|padding|top|left|right|bottom/.test(prop) ? `${init.text}px` : init.text;
      else if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) value = init.text;
      if (value !== null && prop) {
        consumed.add(init);
        out.push(...lintCss(file, `x{${prop}: ${value}}`, { allow, line: lineOf(p.getStart()) }).filter((h) => h.rule !== "motion-no-reduce"));
      }
    }
  };

  const siblingRules = (children: ts.NodeArray<ts.JsxChild>) => {
    const sig = children.filter((c) => !(ts.isJsxText(c) && !c.text.trim()) && !(ts.isJsxExpression(c) && !c.expression));
    sig.forEach((c, i) => {
      if (!(ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c))) return;
      const level = /^h([1-6])$/.exec(tagName(c));
      if (!level || Number(level[1]) > 3) return;
      const prev = sig[i - 1];
      const before = sig[i - 2];
      // A line sitting between two headings belongs to the first one (a subtitle), not the second.
      const subtitle = !!before && (ts.isJsxElement(before) || ts.isJsxSelfClosingElement(before)) && /^h[1-6]$/.test(tagName(before));
      if (prev && !subtitle && (ts.isJsxElement(prev) || ts.isJsxSelfClosingElement(prev))) {
        const lit = literalText(prev);
        if (lit && isEyebrowLabel(tagName(prev), lit.text, lit.hasLink)) {
          out.push(hit(file, lineOf(prev.getStart()), "eyebrow", "short label directly above a heading", lit.text));
        }
      }
      const next = sig[i + 1];
      if (level[1] !== "1" && next && (ts.isJsxElement(next) || ts.isJsxSelfClosingElement(next))) {
        const lit = literalText(next);
        if (lit && isFillerSubtitle(staticClass(next), lit.text, lit.hasLink, lit.hasTime)) {
          out.push(hit(file, lineOf(next.getStart()), "filler-subtitle", "muted filler line under a heading", lit.text));
        }
      }
    });
  };

  const visit = (node: ts.Node, inCode: boolean): void => {
    if (consumed.has(node)) return;
    if (ts.isImportDeclaration(node)) {
      const spec = (node.moduleSpecifier as ts.StringLiteral).text;
      const line = lineOf(node.getStart());
      if (ICON_KITS.test(spec)) out.push(hit(file, line, "icon-kit", `icon kit import "${spec}"`, node.getText()));
      const named = node.importClause?.namedBindings;
      if (spec === "next/font/google" && named && ts.isNamedImports(named)) {
        for (const el of named.elements) {
          const font = (el.propertyName ?? el.name).text.replace(/_/g, " ").toLowerCase();
          if (BANNED_FONTS.includes(font) || BANNED_ANYWHERE.includes(font)) {
            out.push(hit(file, line, "default-font", `default face "${font}" from next/font`, node.getText()));
          }
        }
      }
      return;
    }
    if (ts.isExportDeclaration(node) || ts.isLiteralTypeNode(node) || ts.isTypeNode(node)) return;
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText();
      const init = node.initializer;
      if (!init) return;
      if (name === "className" || name === "class") {
        classString(strings(init).join(" "), lineOf(init.getStart()));
      } else if (name === "style" && ts.isJsxExpression(init) && init.expression && ts.isObjectLiteralExpression(init.expression)) {
        styleObject(init.expression);
      } else if (TEXT_ATTRS.has(name)) {
        for (const s of strings(init)) out.push(...lintText(file, s, lineOf(init.getStart()), { allow, where: name }));
      } else {
        strings(init);
      }
      ts.forEachChild(init, (c) => visit(c, inCode));
      return;
    }
    if (ts.isJsxText(node)) {
      if (!inCode && node.text.trim()) out.push(...lintText(file, decodeEntities(node.text), lineOf(node.pos), { allow }));
      return;
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = tagName(node);
      if (/^h[1-6]$/.test(tag)) {
        const lit = literalText(node);
        if (lit) out.push(...headingHits(file, lit.text, lineOf(node.getStart()), allow));
      }
      if (ts.isJsxElement(node)) siblingRules(node.children);
      ts.forEachChild(node, (c) => visit(c, inCode || NO_TEXT_TAGS.has(tag)));
      return;
    }
    if (ts.isJsxFragment(node)) siblingRules(node.children);
    if (ts.isPropertyAssignment(node) && (ts.isStringLiteral(node.name) || ts.isNoSubstitutionTemplateLiteral(node.name))) consumed.add(node.name);
    if (ts.isElementAccessExpression(node)) strings(node.argumentExpression);
    if (ts.isNewExpression(node) && node.expression.getText() === "RegExp") return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
      const text = ts.isTemplateExpression(node)
        ? [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" ")
        : node.text;
      const line = lineOf(node.getStart());
      if (isClassLike(text)) classString(text, line);
      else if (isProse(text)) out.push(...lintText(file, text, line, { allow, where: "string" }));
      if (ts.isTemplateExpression(node)) node.templateSpans.forEach((s) => visit(s.expression, inCode));
      return;
    }
    ts.forEachChild(node, (c) => visit(c, inCode));
  };
  visit(sf, false);
  return [...out, ...classAggregateHits(file, tokens)];
}

// ---------- MDX ----------

// The Quote component (src/components/mdx/Quote.tsx) holds someone else's words verbatim.
const QUOTE_OPEN = /<Quote\b[^>]*>/;
const QUOTE_CLOSE = /<\/Quote\s*>/;

function lintMdx(file: string, src: string, allow: Allow): Hit[] {
  const out: Hit[] = [];
  const lines = src.split("\n");
  const masked = [...lines];
  const blank = (s: string) => " ".repeat(s.length);
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
    for (let k = 1; k < end; k++) {
      const m = /^(title|description):\s*(.*)$/.exec(lines[k]);
      if (!m) continue;
      const value = m[2].trim().replace(/^(["'])(.*)\1$/, "$2");
      out.push(...lintText(file, value, k + 1, { allow, where: `frontmatter ${m[1]}` }));
      if (m[1] === "title") out.push(...headingHits(file, value, k + 1, allow));
    }
    for (let k = 0; k <= end; k++) masked[k] = "";
  }
  let fence: string | null = null;
  let quote = false;
  // Words between <Quote> and </Quote> are someone else's, quoted verbatim: blank them, keep the tags.
  const maskQuotes = (l: string): string => {
    let out = "";
    let rest = l;
    for (;;) {
      const m = (quote ? QUOTE_CLOSE : QUOTE_OPEN).exec(rest);
      if (!m) return out + (quote ? blank(rest) : rest);
      out += (quote ? blank(rest.slice(0, m.index)) : rest.slice(0, m.index)) + m[0];
      rest = rest.slice(m.index + m[0].length);
      quote = quote ? false : !m[0].endsWith("/>");
    }
  };
  const tokens: ClassToken[] = [];
  masked.forEach((l, k) => {
    const f = /^\s*(`{3,}|~{3,})/.exec(l);
    if (fence !== null) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length) fence = null;
      masked[k] = "";
      return;
    }
    if (f) {
      fence = f[1];
      masked[k] = "";
      return;
    }
    masked[k] = maskQuotes(l)
      .replace(/`[^`]*`/g, blank)
      .replace(/<!--.*?-->/g, blank)
      .replace(/\{\/\*.*?\*\/\}/g, blank)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt: string) => ` ${alt}`)
      .replace(/\]\([^)]*\)/g, "]")
      .replace(/<https?:[^>]*>/g, "")
      .replace(/<\/?[A-Za-z][^>]*>/g, (tag) => {
        const cls = /\sclass(?:Name)?="([^"]*)"/.exec(tag);
        if (cls) {
          out.push(...lintClasses(file, cls[1], k + 1, allow));
          for (const token of cls[1].split(/\s+/).filter(Boolean)) tokens.push({ token, line: k + 1 });
        }
        return "";
      });
    const h = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/.exec(masked[k]);
    if (h) out.push(...headingHits(file, h[1].replace(/[[\]*_]/g, ""), k + 1, allow));
  });
  out.push(...lintText(file, masked.join("\n"), 1, { allow }));
  return [...out, ...classAggregateHits(file, tokens)];
}

// ---------- HTML (built pages) ----------
// A small tokenizer is enough: the pages are React's own well-formed output.

type El = { tag: string; attrs: Record<string, string>; start: number; children: HtmlNode[]; parent: El | null };
type TextNode = { text: string; start: number };
type HtmlNode = El | TextNode;
export type HtmlOptions = { allow?: Allow; built?: boolean };

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RAW_TAGS = new Set(["script", "style", "textarea", "title"]);
// Not visible text: the head, code, scripts, styles and anything hidden (grill log item 4).
const INVISIBLE_TAGS = new Set(["head", "script", "style", "template", "noscript", "pre", "code", "svg", "textarea", "title"]);
const HTML_TEXT_ATTRS = ["alt", "title", "placeholder", "aria-label"];

const isEl = (n: HtmlNode): n is El => "tag" in n;

function parseAttrs(src: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of src.matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

export function parseHtml(html: string): El {
  const root: El = { tag: "#root", attrs: {}, start: 0, children: [], parent: null };
  const lower = html.toLowerCase();
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
  let cur = root;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m.index > last) cur.children.push({ text: html.slice(last, m.index), start: last });
    last = re.lastIndex;
    if (m[0].startsWith("<!")) continue;
    if (m[1]) {
      const tag = m[1].toLowerCase();
      let open: El | null = cur;
      while (open && open.tag !== tag) open = open.parent;
      if (open?.parent) cur = open.parent;
      continue;
    }
    const tag = m[2].toLowerCase();
    const el: El = { tag, attrs: parseAttrs(m[3]), start: m.index, children: [], parent: cur };
    cur.children.push(el);
    if (m[4] === "/" || VOID_TAGS.has(tag)) continue;
    if (RAW_TAGS.has(tag)) {
      const close = lower.indexOf(`</${tag}`, last);
      const end = close < 0 ? html.length : close;
      el.children.push({ text: html.slice(last, end), start: last });
      const gt = html.indexOf(">", end);
      last = re.lastIndex = gt < 0 ? html.length : gt + 1;
      continue;
    }
    cur = el;
  }
  if (last < html.length) cur.children.push({ text: html.slice(last), start: last });
  return root;
}

const invisible = (el: El) => INVISIBLE_TAGS.has(el.tag) || "hidden" in el.attrs;
// Quoted words rendered by the Quote component carry data-verbatim: their text is not ours to fix,
// but their classes and styles are still the page's.
const verbatim = (el: El) => "data-verbatim" in el.attrs;

/** Visible text of an element, leaving out code, citations and hidden parts. */
function textOf(el: El): Literal {
  const acc: Literal = { text: "", hasLink: false, hasTime: false };
  const walk = (n: El) => {
    for (const c of n.children) {
      if (!isEl(c)) acc.text += c.text;
      else {
        if (c.tag === "a") acc.hasLink = true;
        if (c.tag === "time") acc.hasTime = true;
        if (!invisible(c) && c.tag !== "cite") walk(c);
      }
    }
  };
  walk(el);
  acc.text = decodeEntities(acc.text).replace(/\s+/g, " ").trim();
  return acc;
}

const NEW_TAB_HINT = "(opens in a new tab)";

/**
 * The site's new-tab rule for an off-site link (any http or https href; the site links its own
 * pages by path): target="_blank", rel with noopener and noreferrer, and a visually hidden
 * "(opens in a new tab)" for screen readers, as ExternalLink renders it.
 */
function externalLinkHits(file: string, a: El, line: number): Hit[] {
  const href = a.attrs.href ?? "";
  if (!/^https?:\/\//i.test(href)) return [];
  const rel = (a.attrs.rel ?? "").toLowerCase().split(/\s+/);
  const hasHint = (el: El): boolean =>
    el.children.some((c) => isEl(c) && (((c.attrs.class ?? "").split(/\s+/).includes("sr-only") && allText(c).includes(NEW_TAB_HINT)) || hasHint(c)));
  const missing = [
    ...(a.attrs.target === "_blank" ? [] : ['target="_blank"']),
    ...(rel.includes("noopener") && rel.includes("noreferrer") ? [] : ['rel="noopener noreferrer"']),
    ...(hasHint(a) ? [] : [`a visually hidden "${NEW_TAB_HINT}"`]),
  ];
  return missing.length ? [hit(file, line, "external-link", `off-site link without ${missing.join(", ")} (use ExternalLink)`, href)] : [];
}

/** Text, heading, class, style and structure rules over a built page's visible content. */
export function lintHtml(file: string, html: string, opts: HtmlOptions = {}): Hit[] {
  const allow = opts.allow ?? NO_ALLOW;
  const built = opts.built ?? false;
  const lineOf = lineFinder(html);
  const out: Hit[] = [];
  const tokens: ClassToken[] = [];

  const siblings = (el: El) => {
    const sig = el.children.filter((c) => isEl(c) || c.text.trim());
    sig.forEach((c, i) => {
      if (!isEl(c)) return;
      const level = /^h([1-3])$/.exec(c.tag);
      if (!level) return;
      const prev = sig[i - 1];
      const before = sig[i - 2];
      // A line sitting between two headings belongs to the first one (a subtitle), not the second.
      const subtitle = !!before && isEl(before) && /^h[1-6]$/.test(before.tag);
      if (prev && !subtitle && isEl(prev)) {
        const lit = textOf(prev);
        if (isEyebrowLabel(prev.tag, lit.text, lit.hasLink)) out.push(hit(file, lineOf(prev.start), "eyebrow", "short label directly above a heading", lit.text));
      }
      const next = sig[i + 1];
      if (level[1] !== "1" && next && isEl(next)) {
        const lit = textOf(next);
        if (isFillerSubtitle(next.attrs.class ?? "", lit.text, lit.hasLink, lit.hasTime)) {
          out.push(hit(file, lineOf(next.start), "filler-subtitle", "muted filler line under a heading", lit.text));
        }
      }
    });
  };

  const walk = (el: El, visible: boolean, inHead: boolean) => {
    for (const c of el.children) {
      if (!isEl(c)) {
        if (visible && c.text.trim()) out.push(...lintText(file, c.text, lineOf(c.start), { allow }));
        continue;
      }
      const head = inHead || c.tag === "head";
      if (c.tag === "style") {
        const css = c.children[0];
        if (css && !isEl(css)) out.push(...lintCss(file, css.text, { allow, built, line: lineOf(css.start) }));
      }
      if (!head && c.tag !== "template") {
        const line = lineOf(c.start);
        if (c.attrs.class) {
          out.push(...lintClasses(file, c.attrs.class, line, allow, built));
          for (const token of c.attrs.class.split(/\s+/).filter(Boolean)) tokens.push({ token, line });
        }
        if (c.attrs.style) out.push(...lintCss(file, `x{${c.attrs.style}}`, { allow, built, line }).filter((h) => h.rule !== "motion-no-reduce"));
        if (/testimonial/i.test(c.attrs.id ?? "")) out.push(hit(file, line, "testimonial", "testimonial markup", c.attrs.id));
        if (built && c.tag === "a") out.push(...externalLinkHits(file, c, line));
        const shown = visible && !invisible(c) && !verbatim(c);
        if (shown) {
          for (const a of HTML_TEXT_ATTRS) {
            if (!c.attrs[a]) continue;
            out.push(...lintText(file, c.attrs[a], line, { allow, where: a }));
            if (built) out.push(...moneyHits(file, c.attrs[a], line, allow, true));
          }
          if (/^h[1-6]$/.test(c.tag)) out.push(...headingHits(file, textOf(c).text, line, allow));
        }
      }
      walk(c, visible && !invisible(c) && !verbatim(c), head);
    }
    if (visible) siblings(el);
    // Money on built pages: React splits text around expressions with <!-- --> ("$<!-- -->40k"),
    // so each run of adjacent text nodes is joined before the rule runs.
    if (visible && built) {
      let run: TextNode[] = [];
      const flush = () => {
        if (run.length) out.push(...moneyHits(file, run.map((t) => t.text).join(""), lineOf(run[0].start), allow, true));
        run = [];
      };
      for (const c of el.children) {
        if (isEl(c)) flush();
        else run.push(c);
      }
      flush();
    }
  };
  walk(parseHtml(html), true, false);
  return sortHits([...out, ...classAggregateHits(file, tokens)]);
}

// ---------- controls budget ----------

export type Control = { kind: string; name: string; href?: string; line: number; inProse: boolean; scroll: boolean };
export type ControlEntry = { kind: string; href?: string; name?: string; count?: number | "many"; job?: string };
export type RouteBudget = { layout?: boolean; controls: ControlEntry[] };
// dialogs: controls that only exist in the browser once something is opened (the invaders game).
export type ControlsBudget = { layout?: ControlEntry[]; routes: Record<string, RouteBudget>; dialogs?: Record<string, ControlEntry[]> };

const SCROLL_TAGS = new Set(["pre", "table", "div", "section"]);

/** All text under an element, code included: the name of a control. */
function allText(el: El): string {
  const parts: string[] = [];
  const walk = (n: El) => {
    for (const c of n.children) {
      if (!isEl(c)) parts.push(c.text);
      else if (c.tag !== "script" && c.tag !== "style") walk(c);
    }
  };
  walk(el);
  return decodeEntities(parts.join(" ")).replace(/\s+/g, " ").trim();
}

/** Every interactive element on a page: a[href], button, input, select, textarea, summary, iframe, role=button, tabindex=0. */
export function findControls(html: string): Control[] {
  const lineOf = lineFinder(html);
  const out: Control[] = [];
  const walk = (el: El, inProse: boolean) => {
    for (const c of el.children) {
      if (!isEl(c) || ["head", "script", "style", "template", "noscript"].includes(c.tag)) continue;
      const prose = inProse || (c.attrs.class ?? "").split(/\s+/).includes("prose");
      const name = (c.attrs["aria-label"] || allText(c) || c.attrs.title || c.attrs.value || "").trim();
      const base = { name, line: lineOf(c.start), inProse: prose, scroll: false };
      const tag = c.tag;
      if (tag === "a" && "href" in c.attrs) out.push({ ...base, kind: "link", href: c.attrs.href });
      else if (tag === "input" && (c.attrs.type ?? "").toLowerCase() !== "hidden") out.push({ ...base, kind: "input" });
      else if (["button", "select", "textarea", "summary", "iframe"].includes(tag)) out.push({ ...base, kind: tag });
      else if (c.attrs.role === "button" && tag !== "a") out.push({ ...base, kind: "role-button" });
      else if (c.attrs.tabindex === "0") out.push({ ...base, kind: "focusable", scroll: SCROLL_TAGS.has(tag) || c.attrs.role === "region" });
      walk(c, prose);
    }
  };
  walk(parseHtml(html), false);
  return out;
}

/** The budget entries for a route (the shared layout's plus its own), or null when it has none. */
export function entriesFor(budget: ControlsBudget, route: string): ControlEntry[] | null {
  const r = budget.routes[route];
  if (!r) return null;
  return [...(r.layout === false ? [] : (budget.layout ?? [])), ...r.controls];
}

/** What a sighted visitor reads on a link: its text without aria-hidden glyphs or sr-only hints. */
function visibleLabel(el: El): string {
  const parts: string[] = [];
  const walk = (n: El) => {
    for (const c of n.children) {
      if (!isEl(c)) parts.push(c.text);
      else if (c.tag !== "script" && c.tag !== "style" && c.attrs["aria-hidden"] !== "true" && !(c.attrs.class ?? "").split(/\s+/).includes("sr-only")) walk(c);
    }
  };
  walk(el);
  return decodeEntities(parts.join(" ")).replace(/\s+/g, " ").trim();
}

const normalHref = (href: string) => (href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href);

/**
 * Owner review, 4 Oct 2026: each place is linked once per page (duplicate-href) and one visible label
 * never names two places (duplicate-label). Same-page anchors (#...) are exempt from the first rule:
 * they move within the page rather than lead anywhere, and the skip link and footnote references need
 * them; they still count for the second, so an "About" anchor beside an "About" page link fails.
 */
function linkUseHits(file: string, root: El, lineOf: (i: number) => number): Hit[] {
  const out: Hit[] = [];
  const byHref = new Map<string, string>();
  const byLabel = new Map<string, string>();
  const walk = (el: El) => {
    for (const c of el.children) {
      if (!isEl(c) || ["head", "script", "style", "template", "noscript"].includes(c.tag)) continue;
      if (c.tag === "a" && "href" in c.attrs) {
        const href = normalHref(c.attrs.href);
        const label = visibleLabel(c) || (c.attrs["aria-label"] ?? "").trim();
        const line = lineOf(c.start);
        if (!href.startsWith("#")) {
          const first = byHref.get(href);
          if (first !== undefined) out.push(hit(file, line, "duplicate-href", `second link to ${href} on the page (first: "${first}"); link each place once`, label));
          else byHref.set(href, label);
        }
        const key = label.toLowerCase();
        if (key) {
          const other = byLabel.get(key);
          if (other !== undefined && other !== href) out.push(hit(file, line, "duplicate-label", `"${label}" links to ${href} here and to ${other} elsewhere on the page`, label));
          else if (other === undefined) byLabel.set(key, href);
        }
      }
      walk(c);
    }
  };
  walk(root);
  return out;
}

function hrefMatches(pattern: string, href: string): boolean {
  return pattern.endsWith("*") ? href.startsWith(pattern.slice(0, -1)) : pattern === href;
}

/** Controls on one built page against its budget entries (null: the route has no budget). */
export function lintControls(file: string, html: string, entries: ControlEntry[] | null, route: string): Hit[] {
  const out: Hit[] = [];
  const lineOf = lineFinder(html);
  const root = parseHtml(html);
  const walkAnchors = (el: El) => {
    for (const c of el.children) {
      if (!isEl(c)) continue;
      if (c.tag === "a" && !("href" in c.attrs)) out.push(hit(file, lineOf(c.start), "a-no-href", "<a> without href: a link that goes nowhere", textOf(c).text));
      if (c.tag === "a" && c.attrs.role === "button") out.push(hit(file, lineOf(c.start), "role-button-link", 'role="button" on a link: links are links', textOf(c).text));
      walkAnchors(c);
    }
  };
  walkAnchors(root);
  out.push(...linkUseHits(file, root, lineOf));
  const left = new Map<ControlEntry, number>((entries ?? []).map((e) => [e, e.count === "many" ? Infinity : (e.count ?? 1)]));
  const firstLine = new Map<ControlEntry, number>();
  for (const c of findControls(html)) {
    const specific = (entries ?? []).find(
      (e) => (left.get(e) ?? 0) > 0 && e.kind === c.kind && (e.href ? c.href !== undefined && hrefMatches(e.href, c.href) : !!e.name && e.name.toLowerCase() === c.name.toLowerCase()),
    );
    const cls = (entries ?? []).find((e) => (e.kind === "prose links" && c.kind === "link" && c.inProse) || (e.kind === "scroll regions" && c.kind === "focusable" && c.scroll));
    const entry = specific ?? cls;
    if (!entry) {
      const why = entries ? `not in CONTROLS.json for ${route}` : `route ${route} has no entry in CONTROLS.json`;
      out.push(hit(file, c.line, "control-unlisted", `${c.kind} "${c.href ?? c.name}" ${why}`, c.name));
      continue;
    }
    left.set(entry, (left.get(entry) ?? 0) - 1);
    if (!firstLine.has(entry)) firstLine.set(entry, c.line);
  }
  for (const e of entries ?? []) {
    if (!e.job?.trim()) {
      out.push(hit(file, firstLine.get(e) ?? 1, "control-no-job", `CONTROLS.json entry ${e.kind} "${e.href ?? e.name ?? ""}" for ${route} has no job`));
    }
  }
  return out;
}

// ---------- entry point ----------

/** Content files (src/content) also get the money rule over their whole text, code included. */
export const isContent = (file: string) => /(^|\/)content\//.test(file);

export function lintFile(file: string, src: string, allow: Allow = NO_ALLOW): Hit[] {
  const ext = /\.([a-z]+)$/.exec(file)?.[1] ?? "";
  let hits: Hit[] = [];
  if (["ts", "tsx", "mts", "cts", "js", "jsx", "mjs"].includes(ext)) hits = lintScript(file, src, allow);
  else if (ext === "mdx" || ext === "md") hits = lintMdx(file, src, allow);
  else if (ext === "css") hits = lintCss(file, src, { allow });
  else if (ext === "html") hits = lintHtml(file, src, { allow });
  if (isContent(file)) hits.push(...moneyHits(file, src, 1, allow));
  return sortHits(hits);
}
