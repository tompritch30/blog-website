import { describe, expect, it } from "vitest";
import {
  collides,
  createGame,
  createShield,
  invaderGrid,
  marchInterval,
  placeShields,
  shieldRows,
  step,
  waveStartOffset,
  DEFAULTS,
  type GameState,
  type InvaderType,
} from "./engine";
import { MYSTERY_TARGETS } from "./links";

// Worked examples on a small field so every expected number can be checked by hand.
// Field 200 x 300. Ship 20 x 16, 20px above the bottom edge: x = (200 - 20) / 2 = 90, y = 300 - 20 - 16 = 264.
// A bullet is 2 x 8 and leaves the ship's centre top: x = 90 + 10 - 1 = 99, y = 264 - 8 = 256.
// The march ticks every 0.2s (slowest = fastest) and moves 10px a tick unless a test says otherwise.
const field = { w: 200, h: 300 };
const base = {
  shipW: 20,
  shipH: 16,
  shipGap: 20,
  bulletW: 2,
  bulletH: 8,
  bulletSpeed: 400,
  fireCooldown: 0.3,
  margin: 0,
  drop: 10,
  marchStep: 10,
  slowest: 0.2,
  fastest: 0.2,
  bombEvery: Infinity,
  mysteryEvery: Infinity,
};
const still = { marchStep: 0 };
const none = {};
type Spec = { x: number; y: number; w: number; h: number; type?: InvaderType; col?: number };

function game(invaders: Spec[], config = {}, highScore = 0): GameState {
  return createGame({
    field,
    invaders: invaders.map((b, i) => ({ type: 1 as InvaderType, col: i, row: 0, ...b })),
    highScore,
    config: { ...base, ...config },
  });
}

describe("collides (axis-aligned boxes; edges that only touch do not count)", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  it("is false when boxes share only an edge or a corner", () => {
    expect(collides(a, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(collides(a, { x: 0, y: 10, w: 10, h: 10 })).toBe(false);
    expect(collides(a, { x: 10, y: 10, w: 5, h: 5 })).toBe(false);
  });
  it("is true with a one pixel overlap, or when one box contains the other", () => {
    expect(collides(a, { x: 9, y: 0, w: 10, h: 10 })).toBe(true);
    expect(collides(a, { x: 0, y: -9, w: 10, h: 10 })).toBe(true);
    expect(collides(a, { x: 2, y: 2, w: 2, h: 2 })).toBe(true);
  });
  it("is false when apart", () => {
    expect(collides(a, { x: 30, y: 30, w: 1, h: 1 })).toBe(false);
  });
});

describe("invaderGrid (the formation)", () => {
  const grid = invaderGrid({ cols: 3, rows: 5, cellW: 30, cellH: 20, spriteW: 24, spriteH: 16, left: 10, top: 40 });

  it("lays out rows x columns, each sprite centred in its cell", () => {
    expect(grid).toHaveLength(15);
    // row 0, col 0: x = 10 + (30 - 24) / 2 = 13
    expect(grid[0]).toMatchObject({ x: 13, y: 40, w: 24, h: 16, row: 0, col: 0 });
    // row 4, col 2: x = 10 + 60 + 3 = 73, y = 40 + 80 = 120
    expect(grid[14]).toMatchObject({ x: 73, y: 120, row: 4, col: 2 });
  });

  it("has three types: the top row type 3, the next two type 2, the bottom two type 1", () => {
    expect([0, 3, 6, 9, 12].map((i) => grid[i].type)).toEqual([3, 2, 2, 1, 1]);
  });
});

describe("createGame", () => {
  it("places the ship centred above the bottom edge and starts at wave 1", () => {
    const g = game([{ x: 0, y: 0, w: 10, h: 10 }]);
    expect(g.ship).toEqual({ x: 90, y: 264, w: 20, h: 16 });
    expect(g.wave).toBe(1);
    expect(g.score).toBe(0);
    expect(g.status).toBe("playing");
    expect(g.events).toEqual([]);
    expect(g.invaders[0]).toMatchObject({ x: 0, y: 0, w: 10, h: 10, type: 1 });
  });
});

describe("the march tempo (the heartbeat)", () => {
  const cfg = { ...DEFAULTS, slowest: 0.8, fastest: 0.05, waveSpeedUp: 0.9, waveCap: 4, waveLower: 8 };

  it("is slowest with the full formation and fastest with one invader left", () => {
    expect(marchInterval(55, 55, 1, cfg)).toBeCloseTo(0.8);
    expect(marchInterval(1, 55, 1, cfg)).toBeCloseTo(0.05);
    // halfway: 0.05 + 0.75 * 27 / 54 = 0.425
    expect(marchInterval(28, 55, 1, cfg)).toBeCloseTo(0.425);
  });

  it("only ever gets faster as invaders die", () => {
    const curve = Array.from({ length: 55 }, (_, i) => marchInterval(55 - i, 55, 1, cfg));
    curve.slice(1).forEach((v, i) => expect(v).toBeLessThan(curve[i]));
  });

  it("is a little faster each wave, up to a cap", () => {
    expect(marchInterval(55, 55, 2, cfg)).toBeCloseTo(0.72);
    // capped at 4 speed-ups: 0.8 * 0.9^4 = 0.52488
    expect(marchInterval(55, 55, 5, cfg)).toBeCloseTo(0.52488);
    expect(marchInterval(55, 55, 10, cfg)).toBeCloseTo(0.52488);
  });

  it("starts later waves a little lower, up to a cap", () => {
    expect([1, 2, 3, 9].map((w) => waveStartOffset(w, cfg))).toEqual([0, 8, 16, 32]);
  });
});

describe("the invader march", () => {
  it("moves one step per tick, not before, and flips the animation frame", () => {
    let g = game([{ x: 100, y: 20, w: 40, h: 10 }]);
    g = step(g, none, 0.1);
    expect(g.invaders[0]).toMatchObject({ x: 100, y: 20 });
    expect(g.frame).toBe(0);
    g = step(g, none, 0.1);
    expect(g.invaders[0]).toMatchObject({ x: 110, y: 20 });
    expect(g.frame).toBe(1);
  });

  it("drops and reverses instead of crossing the right edge", () => {
    // 155 + 40 + 10 = 205 > 200: stay at x 155, drop 10, turn left
    let g = step(game([{ x: 155, y: 20, w: 40, h: 10 }]), none, 0.2);
    expect(g.invaders[0]).toMatchObject({ x: 155, y: 30 });
    expect(g.dir).toBe(-1);
    g = step(g, none, 0.2);
    expect(g.invaders[0]).toMatchObject({ x: 145, y: 30 });
  });

  it("drops and reverses at the left edge, moving the whole formation together", () => {
    const start = { ...game([{ x: 5, y: 20, w: 10, h: 10 }, { x: 50, y: 20, w: 10, h: 10 }]), dir: -1 as const };
    const g = step(start, none, 0.2);
    expect(g.invaders.map((i) => [i.x, i.y])).toEqual([
      [5, 30],
      [50, 30],
    ]);
    expect(g.dir).toBe(1);
  });

  it("ticks faster as invaders die", () => {
    // slowest 1s with 2 invaders, fastest 0.1s with 1 left
    const g0 = game([{ x: 50, y: 20, w: 10, h: 10 }, { x: 100, y: 20, w: 10, h: 10 }], { slowest: 1, fastest: 0.1 });
    expect(step(g0, none, 0.1).invaders[0].x).toBe(50);
    const one = { ...g0, invaders: [g0.invaders[0]] };
    expect(step(one, none, 0.1).invaders[0].x).toBe(60);
  });
});

describe("the ship", () => {
  it("moves left and right at ship speed and stays on the field", () => {
    const g = game([{ x: 0, y: 0, w: 10, h: 10 }], { ...still, shipSpeed: 200 });
    expect(step(g, { left: true }, 0.1).ship.x).toBe(70);
    expect(step(g, { right: true }, 0.1).ship.x).toBe(110);
    expect(step(g, { left: true }, 1).ship.x).toBe(0);
    expect(step(g, { right: true }, 1).ship.x).toBe(180);
  });

  it("follows a touch target without overshooting it", () => {
    const g = game([{ x: 0, y: 0, w: 10, h: 10 }], { ...still, shipSpeed: 200 });
    expect(step(g, { targetX: 105 }, 0.1).ship.x).toBe(95);
    expect(step(g, { targetX: 10 }, 0.1).ship.x).toBe(70);
  });
});

describe("bullets", () => {
  const side = [{ x: 0, y: 0, w: 10, h: 10 }];

  it("leave the ship's centre top, then move up at bullet speed", () => {
    const fired = step(game(side, still), { fire: true }, 0.1);
    expect(fired.bullets).toEqual([{ x: 99, y: 256, w: 2, h: 8 }]);
    expect(step(fired, none, 0.1).bullets[0].y).toBe(216);
  });

  it("respect the fire cooldown while fire is held", () => {
    let g = step(game(side, still), { fire: true }, 0.1);
    g = step(g, { fire: true }, 0.1);
    expect(g.bullets).toHaveLength(1);
    g = step(g, { fire: true }, 0.1);
    g = step(g, { fire: true }, 0.1);
    expect(g.bullets).toHaveLength(2);
  });

  it("expire once fully above the field", () => {
    let g = step(game(side, still), { fire: true }, 0.1);
    for (let i = 0; i < 6; i++) g = step(g, none, 0.1);
    expect(g.bullets).toHaveLength(1);
    g = step(g, none, 0.1);
    expect(g.bullets).toHaveLength(0);
  });
});

describe("hits and score", () => {
  it("a hit removes the invader and the bullet, even when the bullet moves further than the invader is tall", () => {
    let g = step(game([{ x: 90, y: 200, w: 20, h: 10 }, { x: 0, y: 0, w: 10, h: 10 }], still), { fire: true }, 0.1);
    g = step(g, none, 0.1);
    expect(g.invaders).toHaveLength(2);
    g = step(g, none, 0.1);
    expect(g.invaders).toHaveLength(1);
    expect(g.bullets).toHaveLength(0);
    expect(g.score).toBe(10);
  });

  it("scores 10, 20 and 30 for types 1, 2 and 3", () => {
    const shoot = (type: InvaderType) => {
      const g = step(game([{ x: 90, y: 230, w: 20, h: 10, type }, { x: 0, y: 0, w: 10, h: 10 }], still), { fire: true }, 0.1);
      return step(g, none, 0.1).score;
    };
    expect([shoot(1), shoot(2), shoot(3)]).toEqual([10, 20, 30]);
  });

  it("keeps the best score: a higher stored best stays, a new best replaces it", () => {
    const shoot = (best: number) => {
      const g = step(game([{ x: 90, y: 230, w: 20, h: 10 }, { x: 0, y: 0, w: 10, h: 10 }], still, best), { fire: true }, 0.1);
      return step(g, none, 0.1);
    };
    expect(shoot(50)).toMatchObject({ score: 10, highScore: 50 });
    expect(shoot(5)).toMatchObject({ score: 10, highScore: 10 });
  });
});

describe("waves", () => {
  it("clearing a wave starts the next one with the same invaders, a little lower, shields restored and no bullets", () => {
    const shield = createShield(20, 200, 2, ["##", "##"]);
    let g = createGame({
      field,
      invaders: [{ x: 90, y: 230, w: 20, h: 10, type: 1, col: 0, row: 0 }],
      shields: [shield],
      config: { ...base, ...still, waveLower: 8 },
    });
    g = { ...g, shields: [createShield(20, 200, 2, [".#", "#."])] };
    g = step(step(g, { fire: true }, 0.1), none, 0.1);
    expect(g.wave).toBe(2);
    expect(g.invaders[0]).toMatchObject({ x: 90, y: 238 });
    expect(shieldRows(g.shields[0])).toEqual(["##", "##"]);
    expect(g.bullets).toHaveLength(0);
    expect(g.dir).toBe(1);
  });
});

describe("game over", () => {
  it("ends when an invader reaches the ship's row", () => {
    // at the right edge it drops 10: bottom 250 + 10 + 10 = 270 >= ship top 264
    expect(step(game([{ x: 180, y: 250, w: 20, h: 10 }]), none, 0.2).status).toBe("over");
  });

  it("does not end while invaders are above the ship's row", () => {
    expect(step(game([{ x: 180, y: 240, w: 20, h: 10 }]), none, 0.2).status).toBe("playing");
  });

  it("a finished game no longer changes", () => {
    const over = step(game([{ x: 180, y: 250, w: 20, h: 10 }]), none, 0.2);
    expect(step(over, { left: true, fire: true }, 0.1)).toBe(over);
  });
});

describe("bombs", () => {
  const bombs = { ...still, bombEvery: 0.5, bombSpeed: 200, bombW: 4, bombH: 8 };

  it("drop from the lowest invader of a column, from its bottom centre, on the bomb timer", () => {
    // one column (col 0) with two invaders; the bomb comes from the lower one at y 100..110
    let g = game(
      [
        { x: 90, y: 50, w: 20, h: 10, col: 0 },
        { x: 90, y: 100, w: 20, h: 10, col: 0 },
      ],
      bombs,
    );
    g = step(g, none, 0.4);
    expect(g.bombs).toHaveLength(0);
    g = step(g, none, 0.1);
    expect(g.bombs).toEqual([{ x: 98, y: 110, w: 4, h: 8 }]);
  });

  it("a bomb on the ship costs a life and clears the bombs; the last life ends the game", () => {
    let g = step(game([{ x: 90, y: 100, w: 20, h: 10 }], bombs), none, 0.5);
    expect(g.lives).toBe(3);
    for (let i = 0; i < 8; i++) g = step(g, none, 0.1);
    expect(g.lives).toBe(2);
    expect(g.bombs).toHaveLength(0);
    g = { ...g, lives: 1 };
    for (let i = 0; i < 14; i++) g = step(g, none, 0.1);
    expect(g.status).toBe("over");
  });
});

describe("shields", () => {
  // a 5 x 5 shield of 2px cells at x 95..105, y 200..210; the bullet (x 99..101) lines up with column 2
  const full = ["#####", "#####", "#####", "#####", "#####"];
  const withShield = (rows: string[], extra = {}) =>
    createGame({
      field,
      invaders: [{ x: 0, y: 0, w: 10, h: 10, type: 1, col: 0, row: 0 }],
      shields: [createShield(95, 200, 2, rows)],
      config: { ...base, ...still, ...extra },
    });

  it("placeShields spaces them evenly across the field", () => {
    // 4 shields 20 wide on 200: gap (200 - 80) / 5 = 24
    expect(placeShields(200, 150, 4, 2, ["##########"]).map((s) => s.x)).toEqual([24, 68, 112, 156]);
  });

  it("a bullet from below clears the cell it hits and a small crater above it, and stops", () => {
    // bullet moves 215 -> 175, crossing the whole shield; the lowest filled cell in column 2 is hit
    const g = step({ ...withShield(full), bullets: [{ x: 99, y: 215, w: 2, h: 8 }] }, none, 0.1);
    expect(shieldRows(g.shields[0])).toEqual(["#####", "#####", "##.##", "#...#", "#...#"]);
    expect(g.bullets).toHaveLength(0);
  });

  it("a bomb from above clears the cell it hits and a crater below it, and stops", () => {
    const g = step({ ...withShield(full, { bombSpeed: 400 }), bombs: [{ x: 99, y: 185, w: 2, h: 8 }] }, none, 0.1);
    expect(shieldRows(g.shields[0])).toEqual(["#...#", "#...#", "##.##", "#####", "#####"]);
    expect(g.bombs).toHaveLength(0);
  });

  it("a cleared column lets the next bullet through", () => {
    const holed = ["##.##", "##.##", "##.##", "##.##", "##.##"];
    const g = step({ ...withShield(holed), bullets: [{ x: 99, y: 215, w: 2, h: 8 }] }, none, 0.1);
    expect(shieldRows(g.shields[0])).toEqual(holed);
    expect(g.bullets).toEqual([{ x: 99, y: 175, w: 2, h: 8 }]);
  });

  it("invaders that reach a shield eat the cells they touch", () => {
    // invader 195..201 tall overlaps only row 0 (200..202)
    let g = withShield(full);
    g = { ...g, invaders: [{ ...g.invaders[0], x: 95, y: 191, w: 10, h: 10 }] };
    g = step(g, none, 0.1);
    expect(shieldRows(g.shields[0])).toEqual([".....", "#####", "#####", "#####", "#####"]);
  });
});

describe("the mystery ship", () => {
  const mystery = { ...still, mysteryEvery: 5, mysterySpeed: 100, mysteryW: 20, mysteryH: 8, mysteryY: 30, mysteryPoints: 100 };

  it("crosses the top at intervals, first from the left, and is gone once off the field", () => {
    let g = step(game([{ x: 0, y: 100, w: 10, h: 10 }], mystery), none, 4.9);
    expect(g.mystery).toBeNull();
    g = step(g, none, 0.1);
    expect(g.mystery).toMatchObject({ x: -20, y: 30, w: 20, h: 8, dir: 1 });
    g = step(g, none, 0.1);
    expect(g.mystery?.x).toBe(-10);
    for (let i = 0; i < 22; i++) g = step(g, none, 0.1);
    expect(g.mystery).toBeNull();
  });

  it("no hit, no event", () => {
    const g = step({ ...game([{ x: 0, y: 100, w: 10, h: 10 }], mystery), mystery: { x: 150, y: 30, w: 20, h: 8, dir: 1 } }, { fire: true }, 0.1);
    expect(g.events).toEqual([]);
  });

  // the mystery sits over the ship's column; a bullet just below it; unlocked is the list won in
  // earlier games, as Game.tsx reads it from storage
  const shot = (mysteryHits: number, unlocked?: string[]) =>
    step(
      {
        ...createGame({ field, invaders: [{ x: 0, y: 100, w: 10, h: 10, type: 1, row: 0, col: 0 }], config: { ...base, ...mystery }, unlocked }),
        mystery: { x: 90, y: 30, w: 20, h: 8, dir: 1 as const },
        bullets: [{ x: 99, y: 45, w: 2, h: 8 }],
        mysteryHits,
      },
      none,
      0.1,
    );
  const [paper, github, linkedin] = MYSTERY_TARGETS;

  it("a hit scores, removes it and wins the first link not yet won", () => {
    const first = shot(0);
    expect(first.events).toEqual([{ type: "mystery-hit", target: paper, points: 100, newLink: true }]);
    expect(first.mystery).toBeNull();
    expect(first.score).toBe(100);
    expect(first.mysteryHits).toBe(1);
    expect(first.unlocked).toEqual([paper.href]);
  });

  it("starts from the links won in earlier games, so a new game's first hit is not the paper again", () => {
    const g = shot(0, [paper.href]);
    expect(g.events).toEqual([{ type: "mystery-hit", target: github, points: 100, newLink: true }]);
    expect(g.unlocked).toEqual([paper.href, github.href]);
    expect(shot(0, [github.href, paper.href]).events[0]).toMatchObject({ target: linkedin, newLink: true });
  });

  it("once all three are won, keeps rotating and says no new link was won", () => {
    const all = [linkedin.href, paper.href, github.href];
    expect(shot(0, all).events[0]).toMatchObject({ target: paper, newLink: false });
    expect(shot(1, all).events[0]).toMatchObject({ target: github, newLink: false });
    expect(shot(3, all).events[0]).toMatchObject({ target: paper, newLink: false });
    expect(shot(1, all).unlocked).toEqual(all);
  });

  it("does not change the list it was given", () => {
    const seed = [paper.href];
    shot(0, seed);
    expect(seed).toEqual([paper.href]);
  });

  it("events last one step", () => {
    const g = step(
      { ...game([{ x: 0, y: 100, w: 10, h: 10 }], mystery), mystery: { x: 90, y: 30, w: 20, h: 8, dir: 1 }, bullets: [{ x: 99, y: 45, w: 2, h: 8 }] },
      none,
      0.1,
    );
    expect(step(g, none, 0.1).events).toEqual([]);
  });
});
