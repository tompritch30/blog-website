"use client";

// The hidden game. Loaded only by a dynamic import() from AlienTrigger, so it costs nothing
// until a visitor finds the alien (or types the Konami code). It plays like the arcade
// original: three invader types on a quickening heartbeat, four shields that erode, and a
// golden mystery ship whose hits unlock the paper, GitHub and LinkedIn in turn. A hit never takes
// the player out of the game: the link joins an Unlocked list that the pause and game-over screens
// show as real links (owner, 4 Oct 2026). P or Escape pauses; Escape again, or Quit, closes the game.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createGame,
  invaderGrid,
  placeShields,
  step,
  type Box,
  type Config,
  type Field,
  type GameState,
  type InvaderType,
} from "@/lib/invaders/engine";
import ExternalLink from "@/components/ExternalLink";
import { keyInput, releasedInput, type HeldInput } from "@/lib/invaders/input";
import { readUnlocked, saveUnlocked, unlock, unlockedTargets } from "@/lib/invaders/links";
import { CREATURES, MYSTERY, SHIELD, SHIP, cells } from "./sprites";

const BEST_KEY = "invaders-best";
const MARK_SRC = "/logos/palindrome.svg";
const TOP = 56; // below the 48px score bar
const TITLE = "A game of space invaders";

type Mode = "still" | "play" | "paused" | "over";
type Colours = { bg: string; text: string; secondary: string; divider: string; gold: string };
type Hud = { score: number; best: number; wave: number; lives: number };
type Layout = { field: Field; offsetX: number; px: number; invaders: Parameters<typeof createGame>[0]["invaders"]; shields: GameState["shields"]; config: Partial<Config> };

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
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  // the mystery ship's gold, darker on the light theme to hold 3:1 against the page
  return { bg: v("--bg"), text: v("--text"), secondary: v("--secondary"), divider: v("--divider"), gold: dark ? "#e3b341" : "#9a6f00" };
}

/**
 * The Palindrome mark in the page's ink: the file's viewBox is cropped to the 26 x 26 mark at
 * its left and currentColor is set to the ink, in memory only (the file stays as published).
 */
async function loadMark(ink: string): Promise<HTMLImageElement | null> {
  let url = "";
  try {
    const text = await (await fetch(MARK_SRC)).text();
    const svg = text
      .replace(/viewBox="[^"]*"/, 'viewBox="0 0 26 26" width="104" height="104"')
      .replace(/currentColor/g, ink);
    url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch {
    return null;
  } finally {
    // freed whether or not the image decoded; a decoded image keeps its pixels
    if (url) URL.revokeObjectURL(url);
  }
}

/** Sizes everything from the screen: a centred play column like the arcade's tall screen. */
function layout(vw: number, vh: number): Layout {
  const narrow = vw < 640;
  const px = narrow ? 2 : 3;
  const w = Math.min(vw, 760);
  const field = { w, h: vh };
  const spriteW = 13 * px;
  const spriteH = 11 * px;
  const cols = narrow ? 7 : 11;
  const cellW = spriteW + (narrow ? 10 : 15);
  const cellH = spriteH + (narrow ? 12 : 15);
  const mysteryY = TOP + 8;
  const top = mysteryY + 7 * px + 20;
  const invaders = invaderGrid({ cols, rows: 5, cellW, cellH, spriteW, spriteH, left: (w - cols * cellW) / 2, top });
  const shipGap = narrow ? 80 : 56;
  const shipH = 8 * px;
  const shipTop = vh - shipGap - shipH;
  const shieldH = SHIELD.length * px;
  const shieldY = shipTop - 20 - shieldH;
  const shields = placeShields(w, shieldY, 4, px, SHIELD);
  const bottom = top + 5 * cellH;
  return {
    field,
    offsetX: (vw - w) / 2,
    px,
    invaders,
    shields,
    config: {
      shipW: 13 * px,
      shipH,
      shipGap,
      bulletW: px,
      bulletH: 4 * px,
      bombW: px,
      bombH: 3 * px,
      marchStep: 2 * px,
      // about twelve drops from the formation to the shields
      drop: Math.max(4 * px, Math.round((shieldY - bottom) / 12)),
      mysteryW: MYSTERY[0].length * px,
      mysteryH: MYSTERY.length * px,
      mysteryY,
      mysterySpeed: w / 6,
    },
  };
}

// Sprites as one path each, so a sprite is a single fill (and the gold ship a single shadow).
function spritePath(grid: string[], px: number, mirror = false): Path2D {
  const p = new Path2D();
  const width = grid[0].length;
  for (const [x, y] of cells(grid)) p.rect((mirror ? width - 1 - x : x) * px, y * px, px, px);
  return p;
}

type Paths = { creatures: Record<2 | 3, [Path2D, Path2D]>; ship: Path2D; mystery: [Path2D, Path2D] };

function makePaths(px: number): Paths {
  return {
    creatures: {
      2: [spritePath(CREATURES[2][0], px), spritePath(CREATURES[2][1], px)],
      3: [spritePath(CREATURES[3][0], px), spritePath(CREATURES[3][1], px)],
    },
    ship: spritePath(SHIP, px),
    // the airship's nose points the way it flies
    mystery: [spritePath(MYSTERY, px, true), spritePath(MYSTERY, px)],
  };
}

type Scene = { g: GameState; L: Layout; paths: Paths; mark: HTMLImageElement | null; c: Colours; dpr: number; still: boolean };

function draw(ctx: CanvasRenderingContext2D, { g, L, paths, mark, c, dpr, still }: Scene) {
  const { field, ship } = g;
  const { px } = L;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, field.w + 2 * L.offsetX, field.h);
  ctx.save();
  ctx.translate(L.offsetX, 0);

  // the play column's edges and the ground
  ctx.fillStyle = c.divider;
  if (L.offsetX > 0) {
    ctx.fillRect(-1, 48, 1, field.h - 48);
    ctx.fillRect(field.w, 48, 1, field.h - 48);
  }
  ctx.fillRect(0, ship.y + ship.h + 8, field.w, 1);
  // nothing is drawn outside the play column (the mystery ship enters from beyond its edges)
  ctx.beginPath();
  ctx.rect(0, 48, field.w, field.h - 48);
  ctx.clip();

  const at =(b: Box, fn: () => void) => {
    ctx.save();
    ctx.translate(Math.round(b.x), Math.round(b.y));
    fn();
    ctx.restore();
  };

  ctx.fillStyle = c.text;
  for (const inv of g.invaders) {
    const type: InvaderType = inv.type;
    if (type === 1) {
      // the Palindrome mark, bobbing a pixel with the heartbeat
      const s = inv.h;
      const y = inv.y + (g.frame ? px / 2 : 0);
      if (mark) ctx.drawImage(mark, Math.round(inv.x + (inv.w - s) / 2), Math.round(y), s, s);
      else ctx.fillRect(inv.x + inv.w / 2 - px, inv.y + inv.h / 2 - px, 2 * px, 2 * px);
    } else {
      at(inv, () => ctx.fill(paths.creatures[type][g.frame]));
    }
  }

  ctx.fillStyle = c.secondary;
  for (const s of g.shields) {
    s.cells.forEach((row, r) => row.forEach((on, col) => on && ctx.fillRect(s.x + col * s.cell, s.y + r * s.cell, s.cell, s.cell)));
  }

  ctx.fillStyle = c.text;
  at(ship, () => ctx.fill(paths.ship));
  for (const b of g.bullets) ctx.fillRect(b.x, b.y, b.w, b.h);
  if (still) {
    // the still frame shows one shot on its way up
    ctx.fillRect(ship.x + ship.w / 2 - px / 2, ship.y - field.h * 0.16, px, 4 * px);
  }
  ctx.fillStyle = c.secondary;
  for (const b of g.bombs) ctx.fillRect(b.x, b.y, b.w, b.h);

  // the golden ship: the one glow on the site, one soft shadow, none when still
  const m = still ? { x: field.w * 0.62, y: g.config.mysteryY, w: g.config.mysteryW, h: g.config.mysteryH, dir: -1 as const } : g.mystery;
  if (m) {
    ctx.save();
    ctx.fillStyle = c.gold;
    if (!still) {
      ctx.shadowColor = c.gold;
      ctx.shadowBlur = 8;
    }
    ctx.translate(Math.round(m.x), Math.round(m.y));
    ctx.fill(paths.mystery[m.dir === 1 ? 0 : 1]);
    ctx.restore();
  }
  ctx.restore();
}

export default function Game({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLElement | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const pathsRef = useRef<Paths | null>(null);
  const markRef = useRef<HTMLImageElement | null>(null);
  const coloursRef = useRef<Colours>({ bg: "", text: "", secondary: "", divider: "", gold: "" });
  const dprRef = useRef(1);
  const input = useRef<HeldInput>(releasedInput());
  const pointer = useRef<{ id: number; x: number; t: number; moved: boolean } | null>(null);

  const [mode, setMode] = useState<Mode>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "still" : "play",
  );
  const modeRef = useRef(mode);
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [hud, setHud] = useState<Hud>(() => ({ score: 0, best: readBest(), wave: 1, lives: 3 }));
  // links won from the mystery ship, kept across games and visits (storage inside try and catch)
  const [unlocked, setUnlocked] = useState<string[]>(() => readUnlocked(() => window.localStorage));
  const unlockedRef = useRef(unlocked);
  const [notice, setNotice] = useState("");
  const closing = useRef(false);
  const [said, setSaid] = useState("");

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    const g = gameRef.current;
    const L = layoutRef.current;
    const paths = pathsRef.current;
    if (!ctx || !g || !L || !paths) return;
    draw(ctx, { g, L, paths, mark: markRef.current, c: coloursRef.current, dpr: dprRef.current, still: modeRef.current === "still" });
  }, []);

  const newGame = useCallback((best: number) => {
    const L = layoutRef.current;
    if (!L) return;
    gameRef.current = createGame({ field: L.field, invaders: L.invaders, shields: L.shields, config: L.config, highScore: best, seed: Date.now() });
  }, []);

  // Open: lay out the game, lock the page, draw the first frame.
  // Close (unmount): put the page's style back exactly as it was.
  useEffect(() => {
    const dialog = dialogRef.current;
    const canvas = canvasRef.current;
    if (!dialog || !canvas) return;

    const html = document.documentElement;
    // restore the style attribute byte for byte, including its absence
    const before = html.getAttribute("style");
    if (!dialog.open) dialog.showModal();
    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";

    // Sizes the canvas and lays the game out for the current screen; false when nothing changed.
    let size = "";
    const fit = (): boolean => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const key = `${vw}x${vh}@${dpr}`;
      if (key === size) return false;
      size = key;
      dprRef.current = dpr;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      const L = layout(vw, vh);
      layoutRef.current = L;
      pathsRef.current = makePaths(L.px);
      return true;
    };
    fit();
    coloursRef.current = readColours();
    newGame(readBest());
    redraw();

    // A resize or a turned phone changes the play column, and every position in the game is in its
    // pixels, so the game is laid out again and starts afresh (once per frame, however many events).
    let pending = 0;
    const onResize = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        if (!fit()) return;
        pointer.current = null;
        Object.assign(input.current, { targetX: null, tap: false });
        const best = Math.max(readBest(), gameRef.current?.highScore ?? 0);
        newGame(best);
        // after game over the panel keeps the final score until Play again
        if (modeRef.current !== "over") setHud({ score: 0, best, wave: 1, lives: gameRef.current?.lives ?? 3 });
        redraw();
      });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    let live = true;
    const tintMark = () =>
      loadMark(coloursRef.current.text).then((image) => {
        if (!live) return;
        markRef.current = image;
        if (modeRef.current !== "play") redraw();
      });
    void tintMark();

    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      coloursRef.current = readColours();
      void tintMark();
      if (modeRef.current !== "play") redraw();
    };
    scheme.addEventListener("change", onScheme);

    closing.current = false;
    return () => {
      live = false;
      closing.current = true;
      scheme.removeEventListener("change", onScheme);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cancelAnimationFrame(pending);
      if (before === null) html.removeAttribute("style");
      else html.setAttribute("style", before);
      if (dialog.open) dialog.close();
    };
  }, [newGame, redraw]);

  // Focus goes to the stage while playing, else to the one action on offer. Leaving play lets go of
  // every held key, tap, drag target and pointer, so nothing is still held on resume.
  useEffect(() => {
    modeRef.current = mode;
    if (mode !== "play") {
      input.current = releasedInput();
      pointer.current = null;
    }
    if (mode === "play") stageRef.current?.focus();
    else actionRef.current?.focus();
    if (mode === "still") redraw();
  }, [mode, redraw]);

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
      for (const e of g.events) {
        if (e.type !== "mystery-hit") continue;
        // the game keeps running: the link joins the Unlocked list and a notice shows for 2 seconds
        const next = unlock(unlockedRef.current, e.target.href);
        unlockedRef.current = next;
        setUnlocked(next);
        saveUnlocked(() => window.localStorage, next);
        setNotice(`Unlocked: ${e.target.label}`);
        setSaid(`Mystery ship, ${e.points} points. Unlocked ${e.target.label}; pause to open it.`);
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

  // The unlock notice goes after about 2 seconds; a second hit restarts the clock.
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 2000);
    return () => window.clearTimeout(t);
  }, [notice]);

  // Keyboard: arrows or A and D to move, space to fire, P to pause or resume. A focused control keeps
  // its own keys.
  useEffect(() => {
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (down && e.key.toLowerCase() === "p" && (modeRef.current === "play" || modeRef.current === "paused")) {
        e.preventDefault();
        if (!e.repeat) setMode(modeRef.current === "play" ? "paused" : "play");
        return;
      }
      const playing = modeRef.current === "play";
      const onControl = e.target instanceof HTMLElement && (e.target.tagName === "BUTTON" || e.target.tagName === "A");
      // releases count in any mode, so a key let go while paused is not still held on resume
      const next = keyInput(input.current, e.key, down, { playing, onControl });
      if (!next) return;
      input.current = next;
      // outside play, and for space on a focused control, the control keeps its own keys (a button
      // clicks on space's keyup)
      if (playing && !(onControl && e.key === " ")) e.preventDefault();
    };
    const keydown = onKey(true);
    const keyup = onKey(false);
    const release = () => {
      input.current = releasedInput();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", release);
    };
  }, []);

  // Touch and mouse: drag to move, tap to fire. Positions are taken inside the play column.
  const columnX = (clientX: number) => clientX - (layoutRef.current?.offsetX ?? 0);
  const onPointerDown = (e: React.PointerEvent) => {
    if (modeRef.current !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = { id: e.pointerId, x: e.clientX, t: e.timeStamp, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    if (Math.abs(e.clientX - p.x) > 8) p.moved = true;
    if (p.moved) input.current.targetX = columnX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved && e.timeStamp - p.t < 400) input.current.tap = true;
    pointer.current = null;
  };

  const playAgain = () => {
    newGame(Math.max(hud.best, hud.score));
    setHud((h) => ({ ...h, score: 0, wave: 1, lives: gameRef.current?.lives ?? 3 }));
    setSaid("");
    setMode("play");
  };

  const resume = () => setMode("play");
  const won = unlockedTargets(unlocked);

  // Keep Tab inside the game: a modal dialog alone lets focus leave for the browser's own controls.
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const stops = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? []);
    if (stops.length === 0) return;
    const at = stops.indexOf(document.activeElement as HTMLElement);
    const next = e.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : at === -1 || at === stops.length - 1 ? 0 : at + 1;
    e.preventDefault();
    stops[next].focus();
  };

  const help = touch ? "Drag to move, tap to fire." : "Left and right or A and D to move, space to fire, P or Escape to pause.";
  const control = "border border-divider px-3 py-1.5 text-fg hover:border-fg";
  const bar = "min-h-6 px-2 py-1 text-sm text-fg underline decoration-divider underline-offset-4 hover:decoration-fg";
  // The unlocked links as real links (new tab, said so), on the pause and game-over screens.
  const wonList =
    won.length > 0 ? (
      <p className="mb-3 text-secondary">
        Unlocked:{" "}
        {won.map((t, i) => (
          <span key={t.href}>
            {i > 0 && ", "}
            <ExternalLink href={t.href}>{t.label}</ExternalLink>
          </span>
        ))}
      </p>
    ) : (
      <p className="mb-3 text-secondary">Shoot the golden ship to win a link.</p>
    );

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={TITLE}
      onKeyDown={trapTab}
      // Escape pauses a running game; on any other screen it quits
      onCancel={(e) => {
        e.preventDefault();
        if (modeRef.current === "play") setMode("paused");
        else onClose();
      }}
      // a browser can close a modal dialog itself (repeated Escape); treat that as quitting
      onClose={() => {
        // ignore our own close on unmount, and React's dev remount which reopens it at once
        if (!closing.current && !dialogRef.current?.open) onClose();
      }}
      className="m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-fg backdrop:bg-bg/85"
    >
      <div ref={stageRef} tabIndex={-1} aria-describedby="invaders-help" className="relative h-full w-full focus:outline-none">
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
          <p className="flex gap-1">
            {mode === "play" && (
              // a phone has no P or Escape key
              <button type="button" onClick={() => setMode("paused")} className={bar}>
                Pause
              </button>
            )}
            <button type="button" onClick={onClose} className={bar}>
              Quit
            </button>
          </p>
        </div>
        <p
          id="invaders-help"
          className="absolute inset-x-0 bottom-0 border-t border-divider bg-bg px-4 py-2.5 text-center text-xs text-secondary"
        >
          {help}
        </p>
        {mode !== "play" && (
          <div className="absolute left-1/2 top-1/2 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 border border-divider bg-bg px-5 py-4 text-center text-sm">
            {mode === "paused" ? (
              <>
                <p className="mb-3 text-fg">Paused.</p>
                {wonList}
                <button
                  ref={(el) => {
                    actionRef.current = el;
                  }}
                  type="button"
                  onClick={resume}
                  className={control}
                >
                  Resume
                </button>
              </>
            ) : (
              <>
                <p className="mb-3 text-fg">
                  {mode === "still"
                    ? "Motion is reduced on this device, so this is a still of the game."
                    : `Game over. Score ${hud.score}, best ${Math.max(hud.best, hud.score)}.`}
                </p>
                {mode === "over" && wonList}
                <button
                  ref={(el) => {
                    actionRef.current = el;
                  }}
                  type="button"
                  onClick={mode === "still" ? () => setMode("play") : playAgain}
                  className={control}
                >
                  {mode === "still" ? "Play anyway" : "Play again"}
                </button>
              </>
            )}
          </div>
        )}
        {notice && mode === "play" && (
          // shown for sighted players; the live region below says the same for screen readers
          <p aria-hidden="true" className="absolute left-1/2 top-16 -translate-x-1/2 border border-divider bg-bg px-3 py-1.5 text-sm text-fg">
            {notice}
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
      </div>
    </dialog>,
    document.body,
  );
}
