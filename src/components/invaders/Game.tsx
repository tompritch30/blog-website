"use client";

// The hidden game. Loaded only by a dynamic import() from AlienTrigger, so it costs nothing
// until a visitor finds the alien (or types the Konami code). The headings on the current
// page become the invaders, drawn in their own words, font and colour.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DEFAULTS,
  createGame,
  keepFormation,
  packFormation,
  step,
  type Box,
  type Config,
  type Field,
  type GameState,
} from "@/lib/invaders/engine";
import { SHIP, cells } from "./sprites";

const BEST_KEY = "invaders-best";
const SELECTOR = "main h1, main h2, main h3, main [data-invader]";
const MAX_INVADERS = 18;
const PIXEL = 2;
const TOP = 56; // below the 48px score bar
const SHIP_CELLS = cells(SHIP);

type Mode = "still" | "play" | "over";
type Look = { font: string };
type Invader = Box & Look & { label: string };
type Colours = { text: string; secondary: string; divider: string };
type Hud = { score: number; best: number; wave: number; lives: number };

// Storage can throw (private windows, blocked site data); the game works without it.
function readBest(): number {
  try {
    const n = Number(window.localStorage.getItem(BEST_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function saveBest(n: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(n));
  } catch {
    // nothing to do: the best score lasts for this visit only
  }
}

function readColours(): Colours {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim() || s.color;
  return { text: v("--text"), secondary: v("--secondary"), divider: v("--divider") };
}

function truncate(ctx: CanvasRenderingContext2D, label: string, maxW: number): string {
  if (ctx.measureText(label).width <= maxW) return label;
  const words = label.split(" ");
  let out = "";
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (ctx.measureText(`${next}…`).width > maxW) break;
    out = next;
  }
  if (!out) {
    out = label;
    while (out.length > 1 && ctx.measureText(`${out}…`).width > maxW) out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * Reads the page's headings and post titles. Headings that sit on one line in the top of the
 * screen keep their place; otherwise they are packed into rows, shortened to leave room to march.
 */
function capture(ctx: CanvasRenderingContext2D, field: Field): { invaders: Invader[]; sources: HTMLElement[] } {
  const narrow = field.w < 640;
  const cap = narrow ? 16 : 24;
  const maxW = Math.min(field.w * 0.6, 420);
  const onPage: (Invader & { el: HTMLElement })[] = [];
  const packed: (Omit<Invader, "x" | "y"> & { el: HTMLElement })[] = [];

  const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => !el.closest("dialog"));
  for (const el of els) {
    if (packed.length >= MAX_INVADERS) break;
    const label = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const box = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // skip empty, screen-reader-only and hidden headings
    if (!label || box.width < 4 || box.height < 4 || cs.visibility === "hidden") continue;
    const size = parseFloat(cs.fontSize) || 16;
    const family = cs.fontFamily;
    const weight = cs.fontWeight;

    const range = document.createRange();
    range.selectNodeContents(el);
    const text = range.getBoundingClientRect();
    const font = `${weight} ${size}px ${family}`;
    ctx.font = font;
    const lineH = Math.round(size * 1.3);
    const w = Math.min(ctx.measureText(label).width, box.width);
    // one line, clear of the score bar
    if (text.height < size * 1.9 && text.top >= TOP && ctx.measureText(label).width <= box.width + 1) {
      onPage.push({ el, label, font, w, h: lineH, x: text.left, y: text.top + (text.height - lineH) / 2 });
    }

    const small = Math.min(size, cap);
    const smallFont = `${weight} ${small}px ${family}`;
    ctx.font = smallFont;
    const short = truncate(ctx, label, maxW);
    packed.push({ el, label: short, font: smallFont, w: ctx.measureText(short).width, h: Math.round(small * 1.3) });
  }

  const kept = keepFormation(onPage, field);
  const chosen = kept ?? packFormation(packed, field, { top: TOP });
  if (chosen.length > 0) {
    return {
      invaders: chosen.map(({ label, font, x, y, w, h }) => ({ label, font, x, y, w, h })),
      sources: chosen.map((i) => i.el),
    };
  }

  // a page with no headings: its title's words stand in
  const words = document.title.split(/\s+/).filter(Boolean).slice(0, 8);
  const font = `600 ${cap}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.font = font;
  const items = words.map((label) => ({ label, font, w: ctx.measureText(label).width, h: Math.round(cap * 1.3) }));
  return { invaders: packFormation(items, field, { top: TOP }), sources: [] };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Pace the march to the screen: about five seconds to cross the free width and about twelve
// drops down to the ship, so a game lasts about as long on a phone as on a wide desktop.
function pace(field: Field, invaders: Box[]): Partial<Config> {
  const shipGap = field.w < 640 ? 72 : 56;
  if (invaders.length === 0) return { shipGap };
  const left = Math.min(...invaders.map((i) => i.x));
  const right = Math.max(...invaders.map((i) => i.x + i.w));
  const bottom = Math.max(...invaders.map((i) => i.y + i.h));
  const shipTop = field.h - shipGap - DEFAULTS.shipH;
  return {
    shipGap,
    marchSpeed: clamp((field.w - 2 * DEFAULTS.margin - (right - left)) / 5, 30, 220),
    drop: clamp((shipTop - bottom) / 12, 12, 48),
  };
}

function draw(ctx: CanvasRenderingContext2D, g: GameState, looks: Look[], c: Colours, dpr: number, still = false) {
  const { field, ship } = g;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, field.w, field.h);

  ctx.fillStyle = c.divider;
  ctx.fillRect(0, ship.y + ship.h + 8, field.w, 1);

  ctx.fillStyle = c.text;
  ctx.textBaseline = "middle";
  for (const inv of g.invaders) {
    ctx.font = looks[inv.id]?.font ?? ctx.font;
    ctx.fillText(inv.label, inv.x, inv.y + inv.h / 2);
  }
  for (const [x, y] of SHIP_CELLS) ctx.fillRect(ship.x + x * PIXEL, ship.y + y * PIXEL, PIXEL, PIXEL);
  for (const b of g.bullets) ctx.fillRect(b.x, b.y, b.w, b.h);
  if (still) {
    // the still frame shows one shot on its way up
    const { bulletW, bulletH } = g.config;
    ctx.fillRect(ship.x + ship.w / 2 - bulletW / 2, ship.y - field.h * 0.18, bulletW, bulletH);
  }

  ctx.fillStyle = c.secondary;
  for (const b of g.bombs) ctx.fillRect(b.x, b.y, b.w, b.h);
}

export default function Game({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const startRef = useRef<{ field: Field; invaders: Invader[]; config: Partial<Config> } | null>(null);
  const looksRef = useRef<Look[]>([]);
  const coloursRef = useRef<Colours>({ text: "", secondary: "", divider: "" });
  const dprRef = useRef(1);
  const input = useRef({ left: false, right: false, fire: false, tap: false, targetX: null as number | null });
  const pointer = useRef<{ id: number; x: number; t: number; moved: boolean } | null>(null);

  const [mode, setMode] = useState<Mode>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "still" : "play",
  );
  const modeRef = useRef(mode);
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [hud, setHud] = useState<Hud>(() => ({ score: 0, best: readBest(), wave: 1, lives: 3 }));
  const closing = useRef(false);
  const [said, setSaid] = useState("");

  const redraw = useCallback((still = false) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && gameRef.current) draw(ctx, gameRef.current, looksRef.current, coloursRef.current, dprRef.current, still);
  }, []);

  // Open: capture the headings, hide them, lock the page, draw the first frame.
  // Close (unmount): put every style back exactly as it was.
  useEffect(() => {
    const dialog = dialogRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!dialog || !canvas || !ctx) return;

    const html = document.documentElement;
    // restore the style attributes byte for byte, including their absence
    const saved = (el: HTMLElement) => ({ el, style: el.getAttribute("style") });
    const restore = ({ el, style }: { el: HTMLElement; style: string | null }) =>
      style === null ? el.removeAttribute("style") : el.setAttribute("style", style);
    const field = { w: window.innerWidth, h: window.innerHeight };
    const { invaders, sources } = capture(ctx, field);
    const before = [html, ...sources].map(saved);

    if (!dialog.open) dialog.showModal();
    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";
    sources.forEach((el) => (el.style.visibility = "hidden"));

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = Math.round(field.w * dpr);
    canvas.height = Math.round(field.h * dpr);
    coloursRef.current = readColours();
    looksRef.current = invaders.map(({ font }) => ({ font }));
    const config = pace(field, invaders);
    startRef.current = { field, invaders, config };
    gameRef.current = createGame({ field, invaders, config, highScore: readBest(), seed: Date.now() });
    redraw(modeRef.current === "still");

    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      coloursRef.current = readColours();
      if (modeRef.current !== "play") redraw(modeRef.current === "still");
    };
    scheme.addEventListener("change", onScheme);

    closing.current = false;
    return () => {
      closing.current = true;
      scheme.removeEventListener("change", onScheme);
      before.forEach(restore);
      if (dialog.open) dialog.close();
    };
  }, [redraw]);

  // Focus goes to the stage while playing, else to the one action on offer.
  useEffect(() => {
    modeRef.current = mode;
    if (mode === "play") stageRef.current?.focus();
    else actionRef.current?.focus();
  }, [mode]);

  // The loop runs only in play mode, which reduced motion never enters without a click.
  useEffect(() => {
    if (mode !== "play") return;
    let frame = 0;
    let last = 0;
    let shown = "";
    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const i = input.current;
      const g0 = gameRef.current;
      if (!g0) return;
      const g = step(g0, { left: i.left, right: i.right, fire: i.fire || i.tap, targetX: i.targetX }, dt);
      i.tap = false;
      gameRef.current = g;
      redraw();
      const key = `${g.score}/${g.highScore}/${g.wave}/${g.lives}`;
      if (key !== shown) {
        if (shown && g.wave !== Number(shown.split("/")[2])) setSaid(`Wave ${g.wave}.`);
        shown = key;
        setHud({ score: g.score, best: g.highScore, wave: g.wave, lives: g.lives });
      }
      if (g.status === "over") {
        saveBest(g.highScore);
        setSaid(`Game over. Score ${g.score}, best ${g.highScore}.`);
        setMode("over");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, redraw]);

  // Keyboard: arrows or A and D to move, space to fire. A focused button keeps its own keys.
  useEffect(() => {
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (modeRef.current !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
      const onButton = e.target instanceof HTMLElement && e.target.tagName === "BUTTON";
      const k = e.key.toLowerCase();
      const i = input.current;
      if (k === "arrowleft" || k === "a") {
        i.left = down;
        i.targetX = null;
      } else if (k === "arrowright" || k === "d") {
        i.right = down;
        i.targetX = null;
      } else if (k === " " && !onButton) {
        i.fire = down;
      } else return;
      e.preventDefault();
    };
    const keydown = onKey(true);
    const keyup = onKey(false);
    const release = () => Object.assign(input.current, { left: false, right: false, fire: false });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", release);
    };
  }, []);

  // Touch and mouse: drag to move, tap to fire.
  const onPointerDown = (e: React.PointerEvent) => {
    if (modeRef.current !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = { id: e.pointerId, x: e.clientX, t: e.timeStamp, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    if (Math.abs(e.clientX - p.x) > 8) p.moved = true;
    if (p.moved) input.current.targetX = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved && e.timeStamp - p.t < 400) input.current.tap = true;
    pointer.current = null;
  };

  const playAgain = () => {
    const s = startRef.current;
    if (!s) return;
    gameRef.current = createGame({ ...s, highScore: hud.best, seed: Date.now() });
    setHud((h) => ({ ...h, score: 0, wave: 1, lives: gameRef.current?.lives ?? 3 }));
    setSaid("");
    setMode("play");
  };

  // Keep Tab inside the game: a modal dialog alone lets focus leave for the browser's own controls.
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const stops = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []);
    if (stops.length === 0) return;
    const at = stops.indexOf(document.activeElement as HTMLElement);
    const next = e.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : at === -1 || at === stops.length - 1 ? 0 : at + 1;
    e.preventDefault();
    stops[next].focus();
  };

  const help = touch ? "Drag to move, tap to fire." : "Left and right or A and D to move, space to fire, Escape to quit.";

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label="Invaders: the headings on this page"
      onKeyDown={trapTab}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // a browser can close a modal dialog itself (repeated Escape); treat that as quitting
      onClose={() => {
        // ignore our own close on unmount, and React's dev remount which reopens it at once
        if (!closing.current && !dialogRef.current?.open) onClose();
      }}
      className="m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-fg backdrop:bg-bg/85"
    >
      <div
        ref={stageRef}
        tabIndex={-1}
        aria-describedby="invaders-help"
        className="relative h-full w-full focus:outline-none"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <div className="absolute inset-x-0 top-0 flex h-12 items-center justify-between gap-4 border-b border-divider bg-bg pl-4 pr-2">
          <p className="flex gap-3 font-mono text-xs tabular-nums text-secondary sm:gap-4">
            <span>Score {hud.score}</span>
            <span>Best {Math.max(hud.best, hud.score)}</span>
            <span>Wave {hud.wave}</span>
            <span>Lives {hud.lives}</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-6 px-2 py-1 text-sm text-fg underline decoration-divider underline-offset-4 hover:decoration-fg"
          >
            Close
          </button>
        </div>
        <p
          id="invaders-help"
          className="absolute inset-x-0 bottom-0 border-t border-divider bg-bg px-4 py-2.5 text-center text-xs text-secondary"
        >
          {help}
        </p>
        {mode !== "play" && (
          <div className="absolute left-1/2 top-1/2 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 border border-divider bg-bg px-5 py-4 text-center text-sm">
            <p className="mb-3 text-fg">
              {mode === "still"
                ? "Motion is reduced on this device, so this is a still of the game."
                : `Game over. Score ${hud.score}, best ${Math.max(hud.best, hud.score)}.`}
            </p>
            <button
              ref={actionRef}
              type="button"
              onClick={mode === "still" ? () => setMode("play") : playAgain}
              className="border border-divider px-3 py-1.5 text-fg hover:border-fg"
            >
              {mode === "still" ? "Play anyway" : "Play again"}
            </button>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
      </div>
    </dialog>,
    document.body,
  );
}
