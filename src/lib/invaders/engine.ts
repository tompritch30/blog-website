// Pure engine for the hidden invaders game. No DOM, no clock, no Math.random: the renderer
// passes input and elapsed seconds in, and gets a new state back. Written for this site
// (ADR 0004); the march rule (sideways until an edge, then drop and reverse) is the classic one.
export { createTrigger, KONAMI } from "./trigger";

export type Box = { x: number; y: number; w: number; h: number };
// A word is drawn as text; an image (a small monochrome logo, say) from its src. The engine
// only moves boxes; the renderer reads kind and src.
export type SpriteKind = "word" | "image";
export type Sprite = { label: string; kind?: SpriteKind; src?: string };
export type Invader = Box & Sprite & { id: number };
export type Field = { w: number; h: number };
export type Input = { left?: boolean; right?: boolean; fire?: boolean; targetX?: number | null };
export type Status = "playing" | "over";

export type Config = {
  margin: number; // space kept between the formation and the field's side edges
  marchSpeed: number; // px per second sideways, wave 1
  speedUp: number; // march speed multiplier per wave
  drop: number; // px the formation drops at an edge
  shipW: number;
  shipH: number;
  shipGap: number; // px between the ship's bottom and the field's bottom
  shipSpeed: number;
  bulletW: number;
  bulletH: number;
  bulletSpeed: number;
  fireCooldown: number; // seconds between shots while fire is held
  bombEvery: number; // seconds between bombs, wave 1; Infinity for none
  bombSpeed: number;
  bombW: number;
  bombH: number;
  lives: number;
  points: number;
};

export const DEFAULTS: Config = {
  margin: 16,
  marchSpeed: 36,
  speedUp: 1.25,
  drop: 18,
  shipW: 26,
  shipH: 16,
  shipGap: 28,
  shipSpeed: 280,
  bulletW: 3,
  bulletH: 12,
  bulletSpeed: 520,
  fireCooldown: 0.3,
  bombEvery: 1.4,
  bombSpeed: 170,
  bombW: 4,
  bombH: 10,
  lives: 3,
  points: 10,
};

export type GameState = {
  field: Field;
  config: Config;
  template: Invader[];
  invaders: Invader[];
  ship: Box;
  bullets: Box[];
  bombs: Box[];
  dir: 1 | -1;
  marchSpeed: number;
  wave: number;
  score: number;
  highScore: number;
  lives: number;
  status: Status;
  cooldown: number;
  bombClock: number;
  seed: number;
};

export type GameOptions = {
  field: Field;
  invaders: (Box & Sprite)[];
  highScore?: number;
  seed?: number;
  config?: Partial<Config>;
};

/** Overlap of two boxes. Boxes that only share an edge or a corner do not collide. */
export function collides(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function createGame(opts: GameOptions): GameState {
  const config = { ...DEFAULTS, ...opts.config };
  const template = opts.invaders.map(({ label, kind, src, x, y, w, h }, id) => ({ id, label, kind, src, x, y, w, h }));
  return {
    field: opts.field,
    config,
    template,
    invaders: template.map((i) => ({ ...i })),
    ship: {
      x: (opts.field.w - config.shipW) / 2,
      y: opts.field.h - config.shipGap - config.shipH,
      w: config.shipW,
      h: config.shipH,
    },
    bullets: [],
    bombs: [],
    dir: 1,
    marchSpeed: config.marchSpeed,
    wave: 1,
    score: 0,
    highScore: opts.highScore ?? 0,
    lives: config.lives,
    status: "playing",
    cooldown: 0,
    bombClock: 0,
    seed: (opts.seed ?? 1) >>> 0 || 1,
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

  // ship
  let shipX = state.ship.x;
  if (input.targetX != null) {
    const want = input.targetX - c.shipW / 2;
    const reach = c.shipSpeed * dt;
    shipX += clamp(want - shipX, -reach, reach);
  } else {
    if (input.left) shipX -= c.shipSpeed * dt;
    if (input.right) shipX += c.shipSpeed * dt;
  }
  shipX = clamp(shipX, 0, field.w - c.shipW);
  const ship = { ...state.ship, x: shipX };

  // shots already in flight move first; a new shot appears where it was fired
  const movedBullets = state.bullets
    .map((b) => ({ before: b, after: { ...b, y: b.y - c.bulletSpeed * dt } }))
    .filter(({ after }) => after.y + after.h > 0);
  const movedBombs = state.bombs
    .map((b) => ({ before: b, after: { ...b, y: b.y + c.bombSpeed * dt } }))
    .filter(({ after }) => after.y < field.h);

  // march: the whole formation moves together; if any invader would cross a side edge,
  // the formation drops instead and turns round
  let dir = state.dir;
  let invaders = state.invaders;
  const dx = dir * state.marchSpeed * dt;
  const crosses = invaders.some((i) => i.x + dx < c.margin || i.x + i.w + dx > field.w - c.margin);
  if (crosses && dx !== 0) {
    invaders = invaders.map((i) => ({ ...i, y: i.y + c.drop }));
    dir = dir === 1 ? -1 : 1;
  } else {
    invaders = invaders.map((i) => ({ ...i, x: i.x + dx }));
  }

  // bullets against invaders
  let score = state.score;
  const hitIds = new Set<number>();
  const bullets: Box[] = [];
  for (const { before, after } of movedBullets) {
    const path = swept(before, after);
    const target = invaders.find((i) => !hitIds.has(i.id) && collides(path, i));
    if (target) {
      hitIds.add(target.id);
      score += c.points;
    } else {
      bullets.push(after);
    }
  }
  invaders = invaders.filter((i) => !hitIds.has(i.id));

  // fire
  let cooldown = Math.max(0, state.cooldown - dt);
  if (input.fire && cooldown === 0) {
    bullets.push({ x: ship.x + c.shipW / 2 - c.bulletW / 2, y: ship.y - c.bulletH, w: c.bulletW, h: c.bulletH });
    cooldown = c.fireCooldown;
  }

  // bombs against the ship
  let lives = state.lives;
  let bombs: Box[] = [];
  const shipHit = movedBombs.some(({ before, after }) => collides(swept(before, after), ship));
  if (shipHit) {
    lives -= 1;
  } else {
    bombs = movedBombs.map(({ after }) => after);
  }

  // bomb timer: a seeded pick of a live invader drops one from its bottom centre
  let bombClock = state.bombClock + dt;
  let seed = state.seed;
  const every = c.bombEvery / Math.pow(c.speedUp, state.wave - 1);
  if (!shipHit && invaders.length > 0 && bombClock >= every) {
    bombClock = 0;
    seed = nextSeed(seed);
    const from = invaders[seed % invaders.length];
    bombs.push({ x: from.x + from.w / 2 - c.bombW / 2, y: from.y + from.h, w: c.bombW, h: c.bombH });
  } else if (shipHit) {
    bombClock = 0;
  }

  let next: GameState = {
    ...state,
    ship,
    invaders,
    bullets,
    bombs,
    dir,
    score,
    highScore: Math.max(state.highScore, score),
    lives,
    cooldown,
    bombClock,
    seed,
  };

  if (invaders.length === 0) {
    const wave = state.wave + 1;
    next = {
      ...next,
      wave,
      invaders: state.template.map((i) => ({ ...i })),
      bullets: [],
      bombs: [],
      dir: 1,
      marchSpeed: c.marchSpeed * Math.pow(c.speedUp, wave - 1),
      bombClock: 0,
    };
  }

  const reached = next.invaders.some((i) => i.y + i.h >= ship.y);
  if (reached || lives <= 0) next = { ...next, status: "over" };
  return next;
}

export type FormationItem = { label: string; w: number; h: number };
export type FormationOptions = {
  margin: number; // space kept from the field's side edges
  gap: number; // between items in a row
  top: number; // y of the first row
  width?: number; // widest a row may be; defaults to the field less its margins
  centre?: boolean; // centre the block in the field and each row within the block
};

const FORMATION: FormationOptions = { margin: 16, gap: 24, top: 56 };
const ROW_GAP = 16;

/**
 * Packs items into rows, in order, each row as full as the width allows. Rows that would pass
 * half the field are left out, and an item wider than a row is shortened to the row.
 * Extra fields on the items are carried through.
 */
export function packFormation<T extends FormationItem>(
  items: T[],
  field: Field,
  opts: Partial<FormationOptions> = {},
): (T & Box)[] {
  const o = { ...FORMATION, ...opts };
  const rowW = Math.min(o.width ?? Infinity, field.w - 2 * o.margin);

  const rows: { items: (T & Box)[]; w: number }[] = [];
  let y = o.top;
  let row: { items: (T & Box)[]; w: number } = { items: [], w: 0 };
  let rowH = 0;
  for (const item of items) {
    const w = Math.min(item.w, rowW);
    if (row.items.length > 0 && row.w + o.gap + w > rowW) {
      rows.push(row);
      y += rowH + ROW_GAP;
      row = { items: [], w: 0 };
      rowH = 0;
    }
    if (y + item.h > field.h * 0.5) break;
    const x = row.items.length > 0 ? row.w + o.gap : 0;
    row.items.push({ ...item, x, y, w });
    row.w = x + w;
    rowH = Math.max(rowH, item.h);
  }
  if (row.items.length > 0) rows.push(row);

  const blockW = Math.max(0, ...rows.map((r) => r.w));
  const blockLeft = o.centre ? (field.w - blockW) / 2 : o.margin;
  return rows.flatMap((r) => {
    const shift = blockLeft + (o.centre ? (blockW - r.w) / 2 : 0);
    return r.items.map((i) => ({ ...i, x: i.x + shift }));
  });
}
