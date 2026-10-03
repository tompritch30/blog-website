// Pure engine for the hidden invaders game. No DOM, no clock, no Math.random: the renderer
// passes input and elapsed seconds in, and gets a new state back. Written for this site
// (ADR 0004), after the arcade original's rules: a formation of three invader types that
// steps sideways on a heartbeat which quickens as they die, drops and turns at the edges,
// shields that erode where they are hit, and a mystery ship crossing the top.
import { mysteryTarget, type MysteryTarget } from "./links";

export { createTrigger, KONAMI } from "./trigger";

export type Box = { x: number; y: number; w: number; h: number };
export type Field = { w: number; h: number };
export type InvaderType = 1 | 2 | 3;
export type Invader = Box & { id: number; type: InvaderType; row: number; col: number };
export type Shield = { x: number; y: number; cell: number; cells: boolean[][] };
export type Mystery = Box & { dir: 1 | -1 };
export type Input = { left?: boolean; right?: boolean; fire?: boolean; targetX?: number | null };
export type Status = "playing" | "over";
export type GameEvent = { type: "mystery-hit"; target: MysteryTarget; points: number };

export type Config = {
  margin: number; // space kept between the formation and the field's side edges
  marchStep: number; // px the formation moves per heartbeat
  slowest: number; // seconds between heartbeats with the full formation
  fastest: number; // seconds between heartbeats with one invader left
  waveSpeedUp: number; // heartbeat interval multiplier per wave
  waveLower: number; // px lower each wave starts
  waveCap: number; // waves after which speed and start height stop changing
  drop: number; // px the formation drops at an edge
  shipW: number;
  shipH: number;
  shipGap: number; // px between the ship's bottom and the field's bottom
  shipSpeed: number;
  bulletW: number;
  bulletH: number;
  bulletSpeed: number;
  fireCooldown: number;
  bombEvery: number; // seconds between bombs, wave 1; Infinity for none
  bombSpeed: number;
  bombW: number;
  bombH: number;
  lives: number;
  points: Record<InvaderType, number>;
  mysteryEvery: number; // seconds between mystery ship crossings; Infinity for none
  mysterySpeed: number;
  mysteryW: number;
  mysteryH: number;
  mysteryY: number;
  mysteryPoints: number;
};

export const DEFAULTS: Config = {
  margin: 16,
  marchStep: 8,
  slowest: 0.8,
  fastest: 0.05,
  waveSpeedUp: 0.9,
  waveLower: 12,
  waveCap: 4,
  drop: 16,
  shipW: 26,
  shipH: 16,
  shipGap: 28,
  shipSpeed: 280,
  bulletW: 3,
  bulletH: 12,
  bulletSpeed: 520,
  fireCooldown: 0.3,
  bombEvery: 1.8,
  bombSpeed: 170,
  bombW: 3,
  bombH: 10,
  lives: 3,
  points: { 1: 10, 2: 20, 3: 30 },
  mysteryEvery: 18,
  mysterySpeed: 110,
  mysteryW: 36,
  mysteryH: 10,
  mysteryY: 60,
  mysteryPoints: 100,
};

export type GameState = {
  field: Field;
  config: Config;
  template: Invader[];
  invaders: Invader[];
  shieldTemplate: Shield[];
  shields: Shield[];
  ship: Box;
  bullets: Box[];
  bombs: Box[];
  mystery: Mystery | null;
  mysteryClock: number;
  mysteryRuns: number;
  mysteryHits: number;
  dir: 1 | -1;
  marchClock: number;
  frame: 0 | 1;
  wave: number;
  score: number;
  highScore: number;
  lives: number;
  status: Status;
  cooldown: number;
  bombClock: number;
  seed: number;
  events: GameEvent[];
};

export type GameOptions = {
  field: Field;
  invaders: (Box & { type: InvaderType; row: number; col: number })[];
  shields?: Shield[];
  highScore?: number;
  seed?: number;
  config?: Partial<Config>;
};

/** Overlap of two boxes. Boxes that only share an edge or a corner do not collide. */
export function collides(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export type GridOptions = {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  spriteW: number;
  spriteH: number;
  left: number;
  top: number;
};

/** The formation: the top row is type 3, the next two type 2, the rest type 1. */
export function invaderGrid(o: GridOptions): (Box & { type: InvaderType; row: number; col: number })[] {
  const out: (Box & { type: InvaderType; row: number; col: number })[] = [];
  for (let row = 0; row < o.rows; row++) {
    const type: InvaderType = row === 0 ? 3 : row <= 2 ? 2 : 1;
    for (let col = 0; col < o.cols; col++) {
      out.push({
        type,
        row,
        col,
        x: o.left + col * o.cellW + (o.cellW - o.spriteW) / 2,
        y: o.top + row * o.cellH,
        w: o.spriteW,
        h: o.spriteH,
      });
    }
  }
  return out;
}

/**
 * Seconds between heartbeats: slowest with the whole formation, fastest with one invader
 * left, linear in between, and a little quicker each wave up to waveCap waves.
 */
export function marchInterval(remaining: number, total: number, wave: number, c: Config): number {
  const share = total > 1 ? (remaining - 1) / (total - 1) : 0;
  const base = c.fastest + (c.slowest - c.fastest) * Math.max(0, Math.min(1, share));
  return base * Math.pow(c.waveSpeedUp, Math.min(wave - 1, c.waveCap));
}

/** How much lower than wave 1 a wave starts. */
export function waveStartOffset(wave: number, c: Pick<Config, "waveLower" | "waveCap">): number {
  return Math.min(wave - 1, c.waveCap) * c.waveLower;
}

export function createShield(x: number, y: number, cell: number, rows: string[]): Shield {
  return { x, y, cell, cells: rows.map((r) => Array.from(r, (ch) => ch === "#")) };
}

/** Shields spread evenly across the field: equal gaps between them and at both ends. */
export function placeShields(fieldW: number, y: number, count: number, cell: number, rows: string[]): Shield[] {
  const w = rows[0].length * cell;
  const gap = (fieldW - count * w) / (count + 1);
  return Array.from({ length: count }, (_, i) => createShield(gap + i * (w + gap), y, cell, rows));
}

export function shieldRows(s: Shield): string[] {
  return s.cells.map((r) => r.map((on) => (on ? "#" : ".")).join(""));
}

const shieldBox = (s: Shield): Box => ({ x: s.x, y: s.y, w: (s.cells[0]?.length ?? 0) * s.cell, h: s.cells.length * s.cell });

// The crater a shot leaves, as [column, row] offsets; dir is the shot's travel in rows
// (-1 up for bullets, +1 down for bombs), so the crater reaches into the shield.
const crater = (dir: number): [number, number][] => [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, dir],
  [-1, dir],
  [1, dir],
  [0, 2 * dir],
];

/**
 * A shot's path against the shields. If it meets a filled cell, that cell and a crater around
 * it are cleared and the shot stops (returns the new shields and true).
 */
function hitShields(shields: Shield[], path: Box, dir: 1 | -1): [Shield[], boolean] {
  for (let si = 0; si < shields.length; si++) {
    const s = shields[si];
    if (!collides(path, shieldBox(s))) continue;
    let hc = -1;
    let hr = -1;
    for (let r = 0; r < s.cells.length; r++) {
      for (let c = 0; c < s.cells[r].length; c++) {
        if (!s.cells[r][c] || !collides(path, { x: s.x + c * s.cell, y: s.y + r * s.cell, w: s.cell, h: s.cell })) continue;
        // first cell met: the lowest for a bullet going up, the highest for a bomb going down
        if (hr === -1 || (dir === -1 ? r > hr : r < hr)) [hc, hr] = [c, r];
      }
    }
    if (hr === -1) continue;
    const cells = s.cells.map((row) => [...row]);
    for (const [dc, dr] of crater(dir)) {
      const r = hr + dr;
      const c = hc + dc;
      if (cells[r]?.[c] !== undefined) cells[r][c] = false;
    }
    const next = [...shields];
    next[si] = { ...s, cells };
    return [next, true];
  }
  return [shields, false];
}

/** Invaders eat any shield cells they touch. */
function eatShields(shields: Shield[], invaders: Box[]): Shield[] {
  return shields.map((s) => {
    if (!invaders.some((i) => collides(i, shieldBox(s)))) return s;
    const cells = s.cells.map((row, r) =>
      row.map((on, c) => on && !invaders.some((i) => collides(i, { x: s.x + c * s.cell, y: s.y + r * s.cell, w: s.cell, h: s.cell }))),
    );
    return { ...s, cells };
  });
}

export function createGame(opts: GameOptions): GameState {
  const config = { ...DEFAULTS, ...opts.config };
  const template = opts.invaders.map(({ type, row, col, x, y, w, h }, id) => ({ id, type, row, col, x, y, w, h }));
  const shields = opts.shields ?? [];
  return {
    field: opts.field,
    config,
    template,
    invaders: template.map((i) => ({ ...i })),
    shieldTemplate: shields,
    shields,
    ship: {
      x: (opts.field.w - config.shipW) / 2,
      y: opts.field.h - config.shipGap - config.shipH,
      w: config.shipW,
      h: config.shipH,
    },
    bullets: [],
    bombs: [],
    mystery: null,
    mysteryClock: 0,
    mysteryRuns: 0,
    mysteryHits: 0,
    dir: 1,
    marchClock: 0,
    frame: 0,
    wave: 1,
    score: 0,
    highScore: opts.highScore ?? 0,
    lives: config.lives,
    status: "playing",
    cooldown: 0,
    bombClock: 0,
    seed: (opts.seed ?? 1) >>> 0 || 1,
    events: [],
  };
}

// xorshift32: deterministic, so a seeded game replays the same bombs
function nextSeed(s: number): number {
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return s >>> 0;
}

// The box a shot swept through this step, so a fast shot cannot skip over a thin target.
function swept(before: Box, after: Box): Box {
  const top = Math.min(before.y, after.y);
  const bottom = Math.max(before.y + before.h, after.y + after.h);
  return { x: after.x, y: top, w: after.w, h: bottom - top };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function step(state: GameState, input: Input, dt: number): GameState {
  if (state.status === "over") return state;
  const c = state.config;
  const { field } = state;
  const events: GameEvent[] = [];

  // ship
  let shipX = state.ship.x;
  if (input.targetX != null) {
    const reach = c.shipSpeed * dt;
    shipX += clamp(input.targetX - c.shipW / 2 - shipX, -reach, reach);
  } else {
    if (input.left) shipX -= c.shipSpeed * dt;
    if (input.right) shipX += c.shipSpeed * dt;
  }
  const ship = { ...state.ship, x: clamp(shipX, 0, field.w - c.shipW) };

  // the march: one step per heartbeat; at an edge the formation drops and turns instead
  let { dir, frame, marchClock } = state;
  let invaders = state.invaders;
  marchClock += dt;
  for (let beats = 0; beats < 4; beats++) {
    const interval = marchInterval(invaders.length, state.template.length, state.wave, c);
    if (marchClock < interval) break;
    marchClock -= interval;
    frame = frame === 0 ? 1 : 0;
    const dx = dir * c.marchStep;
    const crosses = dx !== 0 && invaders.some((i) => i.x + dx < c.margin || i.x + i.w + dx > field.w - c.margin);
    if (crosses) {
      invaders = invaders.map((i) => ({ ...i, y: i.y + c.drop }));
      dir = dir === 1 ? -1 : 1;
    } else if (dx !== 0) {
      invaders = invaders.map((i) => ({ ...i, x: i.x + dx }));
    }
  }
  let shields = eatShields(state.shields, invaders);

  // the mystery ship crosses the top, alternating sides
  let { mystery, mysteryClock, mysteryRuns, mysteryHits } = state;
  if (mystery) {
    const x = mystery.x + mystery.dir * c.mysterySpeed * dt;
    mystery = x > field.w || x + mystery.w < 0 ? null : { ...mystery, x };
  } else {
    mysteryClock += dt;
    if (mysteryClock >= c.mysteryEvery) {
      mysteryClock = 0;
      const right = mysteryRuns % 2 === 0;
      mystery = { x: right ? -c.mysteryW : field.w, y: c.mysteryY, w: c.mysteryW, h: c.mysteryH, dir: right ? 1 : -1 };
      mysteryRuns += 1;
    }
  }

  // bullets: shields first (lowest), then invaders, then the mystery ship
  let score = state.score;
  const hitIds = new Set<number>();
  const bullets: Box[] = [];
  for (const b of state.bullets) {
    const after = { ...b, y: b.y - c.bulletSpeed * dt };
    const path = swept(b, after);
    const [nextShields, stopped] = hitShields(shields, path, -1);
    shields = nextShields;
    if (stopped) continue;
    const target = invaders.find((i) => !hitIds.has(i.id) && collides(path, i));
    if (target) {
      hitIds.add(target.id);
      score += c.points[target.type];
      continue;
    }
    if (mystery && collides(path, mystery)) {
      events.push({ type: "mystery-hit", target: mysteryTarget(mysteryHits), points: c.mysteryPoints });
      score += c.mysteryPoints;
      mysteryHits += 1;
      mystery = null;
      continue;
    }
    if (after.y + after.h > 0) bullets.push(after);
  }
  invaders = invaders.filter((i) => !hitIds.has(i.id));

  // fire: a new shot appears where it is fired and moves from the next step
  let cooldown = Math.max(0, state.cooldown - dt);
  if (input.fire && cooldown === 0) {
    bullets.push({ x: ship.x + c.shipW / 2 - c.bulletW / 2, y: ship.y - c.bulletH, w: c.bulletW, h: c.bulletH });
    cooldown = c.fireCooldown;
  }

  // bombs: shields, then the ship
  let lives = state.lives;
  let shipHit = false;
  let bombs: Box[] = [];
  for (const b of state.bombs) {
    const after = { ...b, y: b.y + c.bombSpeed * dt };
    const path = swept(b, after);
    const [nextShields, stopped] = hitShields(shields, path, 1);
    shields = nextShields;
    if (stopped) continue;
    if (collides(path, ship)) shipHit = true;
    else if (after.y < field.h) bombs.push(after);
  }
  if (shipHit) {
    lives -= 1;
    bombs = [];
  }

  // the bomb timer: a seeded pick of a column, a third of the time the one nearest the ship;
  // the bomb drops from that column's lowest invader
  let bombClock = shipHit ? 0 : state.bombClock + dt;
  let seed = state.seed;
  const every = c.bombEvery * Math.pow(c.waveSpeedUp, Math.min(state.wave - 1, c.waveCap));
  if (!shipHit && invaders.length > 0 && bombClock >= every) {
    bombClock = 0;
    seed = nextSeed(seed);
    const lowest = new Map<number, Invader>();
    for (const i of invaders) {
      const prev = lowest.get(i.col);
      if (!prev || i.y > prev.y) lowest.set(i.col, i);
    }
    const columns = [...lowest.values()];
    const centre = ship.x + ship.w / 2;
    const from =
      seed % 3 === 0
        ? columns.reduce((a, b) => (Math.abs(b.x + b.w / 2 - centre) < Math.abs(a.x + a.w / 2 - centre) ? b : a))
        : columns[(seed >>> 2) % columns.length];
    bombs.push({ x: from.x + from.w / 2 - c.bombW / 2, y: from.y + from.h, w: c.bombW, h: c.bombH });
  }

  let next: GameState = {
    ...state,
    ship,
    invaders,
    shields,
    bullets,
    bombs,
    mystery,
    mysteryClock,
    mysteryRuns,
    mysteryHits,
    dir,
    marchClock,
    frame,
    score,
    highScore: Math.max(state.highScore, score),
    lives,
    cooldown,
    bombClock,
    seed,
    events,
  };

  if (invaders.length === 0) {
    const wave = state.wave + 1;
    const lower = waveStartOffset(wave, c);
    next = {
      ...next,
      wave,
      invaders: state.template.map((i) => ({ ...i, y: i.y + lower })),
      shields: state.shieldTemplate,
      bullets: [],
      bombs: [],
      mystery: null,
      dir: 1,
      marchClock: 0,
      bombClock: 0,
    };
  }

  const reached = next.invaders.some((i) => i.y + i.h >= ship.y);
  if (reached || lives <= 0) next = { ...next, status: "over" };
  return next;
}
