// Side-by-side images of the web CV and the PDF CV it recreates, for the owner to compare. Starts nothing.
//
//   node scripts/cv-compare.mts <base URL> --ref <page image> [--out <dir>] [--redact x,y,w,h ...]
//
// <page image> is a PNG of the PDF's first page drawn at 96 dpi (a US Letter page is 816x1056 there),
// on its own or on a plain margin, which is trimmed off. --redact paints over a box of that page (page
// pixels) before it is used, for lines that should not sit in a picture.
//
// Writes two PNGs, each under 400KB, both at 96 dpi so the two halves are at the same scale:
//   cv-compare-1440.png    /cv's sheet at 1440x900 in the light theme | the PDF page
//   cv-compare-print.png   /cv printed (print media, US Letter, the PDF's margins) | the PDF page
// The PDF page carries his private contact line, so these files stay out of git (.gitignore).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const DPI = 96;
const PAGE = { w: 8.5 * DPI, h: 11 * DPI };
const MARGIN = { x: 0.6 * DPI, y: 0.5 * DPI }; // the PDF CV's margins (and the site's @page margins)
const GAP = 32;
const HEAD = 44;
const MAX = 400 * 1024;

function fail(message: string): never {
  console.error(`cv-compare: ${message}`);
  process.exit(2);
}

const args = process.argv.slice(2);
let base = "";
let ref = "";
let out = "design/shots";
const redact: number[][] = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--ref") ref = args[++i] ?? fail("--ref needs a PNG");
  else if (a === "--out") out = args[++i] ?? fail("--out needs a folder");
  else if (a === "--redact") {
    const box = (args[++i] ?? "").split(",").map(Number);
    if (box.length !== 4 || box.some((n) => !Number.isFinite(n))) fail("--redact needs x,y,w,h");
    redact.push(box);
  } else if (a.startsWith("--")) fail(`unknown option ${a}`);
  else base = a.replace(/\/$/, "");
}
if (!base || !ref) fail("usage: node scripts/cv-compare.mts <base URL> --ref <page image> [--out <dir>] [--redact x,y,w,h]");
if (!fs.existsSync(ref)) fail(`no such file: ${ref}`);

/** The PDF page: the reference image with any plain margin around the white page trimmed, then redacted. */
async function pdfPage(): Promise<Buffer> {
  const { data, info } = await sharp(ref).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const white = (x: number, y: number) => {
    const i = (y * info.width + x) * 3;
    return data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250;
  };
  const midY = Math.floor(info.height / 2);
  const midX = Math.floor(info.width / 2);
  let left = 0;
  while (left < info.width && !white(left, midY)) left++;
  let right = info.width - 1;
  while (right > left && !white(right, midY)) right--;
  let top = 0;
  while (top < info.height && !white(midX, top)) top++;
  let bottom = info.height - 1;
  while (bottom > top && !white(midX, bottom)) bottom--;
  const width = right - left + 1;
  const height = bottom - top + 1;
  let page = sharp(ref).removeAlpha().extract({ left, top, width, height });
  if (redact.length) {
    const boxes = redact.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#c8ccc6"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${boxes}</svg>`;
    page = sharp(await page.png().toBuffer()).composite([{ input: Buffer.from(svg) }]);
  }
  const buf = await page.png().toBuffer();
  const meta = await sharp(buf).metadata();
  console.log(`pdf page: ${meta.width}x${meta.height} from ${path.basename(ref)} (trimmed at ${left},${top}; ${redact.length} box${redact.length === 1 ? "" : "es"} redacted)`);
  return buf;
}

const label = (text: string, x: number) => `<text x="${x}" y="28" font-family="DejaVu Sans, sans-serif" font-size="16" fill="#1a1e1c">${text}</text>`;

async function sideBySide(left: Buffer, right: Buffer, labels: [string, string], file: string): Promise<void> {
  const [a, b] = await Promise.all([sharp(left).metadata(), sharp(right).metadata()]);
  const width = a.width! + GAP + b.width! + 2 * GAP;
  const height = HEAD + Math.max(a.height!, b.height!) + GAP;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEAD}">${label(labels[0], GAP)}${label(labels[1], GAP + a.width! + GAP)}</svg>`;
  const png = await sharp({ create: { width, height, channels: 3, background: "#e9ebe5" } })
    .composite([
      { input: Buffer.from(svg), left: 0, top: 0 },
      { input: left, left: GAP, top: HEAD },
      { input: right, left: GAP + a.width! + GAP, top: HEAD },
    ])
    .png()
    .toBuffer();
  let outBuf = Buffer.alloc(0);
  for (const colours of [256, 128, 64]) {
    outBuf = await sharp(png).png({ palette: true, colours, compressionLevel: 9, effort: 10 }).toBuffer();
    if (outBuf.length < MAX) break;
  }
  fs.writeFileSync(path.join(out, file), outBuf);
  console.log(`${outBuf.length < MAX ? "pass" : "FAIL"}  ${path.join(out, file)} ${width}x${height}, ${(outBuf.length / 1024).toFixed(0)} KB`);
  if (outBuf.length >= MAX) process.exitCode = 1;
}

const right = await pdfPage();
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

// On screen: the sheet itself at 1440 wide, light theme.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(`${base}/cv`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const sheet = await page.locator(".cv-sheet").screenshot({ animations: "disabled" });
  await sideBySide(sheet, right, ["/cv at 1440, light", "PDF CV, page 1"], "cv-compare-1440.png");
  await ctx.close();
}

// On paper: print media at the US Letter text width, set on a white page inside the PDF's margins.
{
  const textWidth = Math.round(PAGE.w - 2 * MARGIN.x);
  const ctx = await browser.newContext({ viewport: { width: textWidth, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(`${base}/cv`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);
  const sheet = await page.locator(".cv-sheet").screenshot({ animations: "disabled" });
  const meta = await sharp(sheet).metadata();
  const pageHeight = Math.max(PAGE.h, meta.height! + 2 * MARGIN.y);
  const paper = await sharp({ create: { width: PAGE.w, height: pageHeight, channels: 3, background: "#ffffff" } })
    .composite([{ input: sheet, left: Math.round(MARGIN.x), top: Math.round(MARGIN.y) }])
    .png()
    .toBuffer();
  console.log(`print: text block ${meta.width}x${meta.height}, page ${PAGE.w}x${pageHeight}${pageHeight > PAGE.h ? " (runs past one Letter page)" : ""}`);
  await sideBySide(paper, right, ["/cv printed, US Letter", "PDF CV, page 1"], "cv-compare-print.png");
  await ctx.close();
}

await browser.close();
