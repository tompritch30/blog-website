import { describe, expect, it } from "vitest";
import { collides, createGame, packFormation, step, type GameState } from "./engine";

// Worked examples on a small field so every expected number can be checked by hand.
// Field 200 x 300. Ship 20 x 16, 20px above the bottom edge: x = (200 - 20) / 2 = 90, y = 300 - 20 - 16 = 264.
// A bullet is 2 x 8 and leaves the ship's centre top: x = 90 + 10 - 1 = 99, y = 264 - 8 = 256.
const field = { w: 200, h: 300 };
const still = { marchSpeed: 0, bombEvery: Infinity };
const none = {};

function game(invaders: { x: number; y: number; w: number; h: number }[], config = {}, highScore = 0): GameState {
  return createGame({
    field,
    invaders: invaders.map((b, i) => ({ ...b, label: `Heading ${i + 1}` })),
    highScore,
    config: { shipW: 20, shipH: 16, shipGap: 20, bulletW: 2, bulletH: 8, bulletSpeed: 400, fireCooldown: 0.3, margin: 0, drop: 10, ...config },
  });
}

describe("collides (axis-aligned boxes; edges that only touch do not count)", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  it("is false when boxes share only an edge", () => {
    expect(collides(a, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(collides(a, { x: 0, y: 10, w: 10, h: 10 })).toBe(false);
  });
  it("is false when boxes share only a corner", () => {
    expect(collides(a, { x: 10, y: 10, w: 5, h: 5 })).toBe(false);
  });
  it("is true with a one pixel overlap", () => {
    expect(collides(a, { x: 9, y: 0, w: 10, h: 10 })).toBe(true);
    expect(collides(a, { x: 0, y: -9, w: 10, h: 10 })).toBe(true);
  });
  it("is true when one box contains the other", () => {
    expect(collides(a, { x: 2, y: 2, w: 2, h: 2 })).toBe(true);
  });
  it("is false when apart", () => {
    expect(collides(a, { x: 30, y: 30, w: 1, h: 1 })).toBe(false);
  });
});

describe("createGame", () => {
  it("places the ship centred above the bottom edge and starts at wave 1", () => {
    const g = game([{ x: 0, y: 0, w: 10, h: 10 }]);
    expect(g.ship).toEqual({ x: 90, y: 264, w: 20, h: 16 });
    expect(g.wave).toBe(1);
    expect(g.score).toBe(0);
    expect(g.status).toBe("playing");
    expect(g.invaders[0]).toMatchObject({ x: 0, y: 0, w: 10, h: 10, label: "Heading 1" });
  });
});

describe("the invader march", () => {
  it("moves sideways at the march speed", () => {
    // 100 + 50 * 0.2 = 110
    const g = step(game([{ x: 100, y: 20, w: 40, h: 10 }], { marchSpeed: 50, bombEvery: Infinity }), none, 0.2);
    expect(g.invaders[0]).toMatchObject({ x: 110, y: 20 });
    expect(g.dir).toBe(1);
  });

  it("drops and reverses instead of crossing the right edge", () => {
    // right edge would be 155 + 10 + 40 = 205 > 200: stay at x 155, drop 10, turn left
    const g = step(game([{ x: 155, y: 20, w: 40, h: 10 }], { marchSpeed: 50, bombEvery: Infinity }), none, 0.2);
    expect(g.invaders[0]).toMatchObject({ x: 155, y: 30 });
    expect(g.dir).toBe(-1);
    const next = step(g, none, 0.2);
    expect(next.invaders[0]).toMatchObject({ x: 145, y: 30 });
  });

  it("drops and reverses at the left edge, moving the whole formation together", () => {
    const start = { ...game([{ x: 5, y: 20, w: 10, h: 10 }, { x: 50, y: 20, w: 10, h: 10 }], { marchSpeed: 50, bombEvery: Infinity }), dir: -1 as const };
    const g = step(start, none, 0.2);
    expect(g.invaders.map((i) => [i.x, i.y])).toEqual([
      [5, 30],
      [50, 30],
    ]);
    expect(g.dir).toBe(1);
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
    // ship centre is 100; target 105 is closer than 200 * 0.1 = 20, so the centre lands on it
    expect(step(g, { targetX: 105 }, 0.1).ship.x).toBe(95);
    expect(step(g, { targetX: 10 }, 0.1).ship.x).toBe(70);
  });
});

describe("bullets", () => {
  const side = [{ x: 0, y: 0, w: 10, h: 10 }];

  it("leave the ship's centre top, then move up at bullet speed", () => {
    const fired = step(game(side, still), { fire: true }, 0.1);
    expect(fired.bullets).toEqual([{ x: 99, y: 256, w: 2, h: 8 }]);
    // 256 - 400 * 0.1 = 216
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
    // 6 steps: 256 - 240 = 16, still on the field; 7 steps: -24, bottom at -16, gone
    for (let i = 0; i < 6; i++) g = step(g, none, 0.1);
    expect(g.bullets).toHaveLength(1);
    g = step(g, none, 0.1);
    expect(g.bullets).toHaveLength(0);
  });
});

describe("hits and score", () => {
  it("a hit removes the invader and the bullet and scores 10, even when the bullet moves further than the invader is tall", () => {
    // invader 200..210 tall; bullet goes 256 -> 216 -> 176 and would skip over it without a swept check
    let g = step(game([{ x: 90, y: 200, w: 20, h: 10 }, { x: 0, y: 0, w: 10, h: 10 }], still), { fire: true }, 0.1);
    g = step(g, none, 0.1);
    expect(g.invaders).toHaveLength(2);
    g = step(g, none, 0.1);
    expect(g.invaders.map((i) => i.label)).toEqual(["Heading 2"]);
    expect(g.bullets).toHaveLength(0);
    expect(g.score).toBe(10);
  });

  it("keeps the best score: a higher stored best stays, a new best replaces it", () => {
    const shoot = (best: number) => {
      let g = step(game([{ x: 90, y: 230, w: 20, h: 10 }, { x: 0, y: 0, w: 10, h: 10 }], still, best), { fire: true }, 0.1);
      g = step(g, none, 0.1);
      return g;
    };
    expect(shoot(50)).toMatchObject({ score: 10, highScore: 50 });
    expect(shoot(5)).toMatchObject({ score: 10, highScore: 10 });
  });
});

describe("waves", () => {
  it("clearing a wave starts the next one with the same invaders, a faster march and no bullets", () => {
    let g = step(game([{ x: 90, y: 230, w: 20, h: 10 }], { marchSpeed: 0, bombEvery: Infinity }), { fire: true }, 0.1);
    g = step(g, none, 0.1);
    expect(g.wave).toBe(2);
    expect(g.invaders).toHaveLength(1);
    expect(g.invaders[0]).toMatchObject({ x: 90, y: 230, label: "Heading 1" });
    expect(g.bullets).toHaveLength(0);
    expect(g.dir).toBe(1);
  });

  it("each wave marches 1.25 times faster than the last", () => {
    let g = game([{ x: 90, y: 230, w: 20, h: 10 }], { marchSpeed: 40, bombEvery: Infinity });
    expect(g.marchSpeed).toBe(40);
    g = { ...g, invaders: [{ ...g.invaders[0], x: 90, y: 230 }], marchSpeed: 0 };
    g = step(step(g, { fire: true }, 0.1), none, 0.1);
    expect(g.wave).toBe(2);
    expect(g.marchSpeed).toBe(50);
  });
});

describe("game over", () => {
  it("ends when an invader reaches the ship's row", () => {
    // at the right edge, drops 10: bottom 250 + 10 + 10 = 270 >= ship top 264
    const g = step(game([{ x: 180, y: 250, w: 20, h: 10 }], { marchSpeed: 50, bombEvery: Infinity }), none, 0.1);
    expect(g.status).toBe("over");
  });

  it("does not end while invaders are above the ship's row", () => {
    const g = step(game([{ x: 180, y: 240, w: 20, h: 10 }], { marchSpeed: 50, bombEvery: Infinity }), none, 0.1);
    expect(g.status).toBe("playing");
  });

  it("a finished game no longer changes", () => {
    const over = step(game([{ x: 180, y: 250, w: 20, h: 10 }], { marchSpeed: 50, bombEvery: Infinity }), none, 0.1);
    expect(step(over, { left: true, fire: true }, 0.1)).toBe(over);
  });
});

describe("bombs", () => {
  // one invader straight above the ship; bombs every 0.5s, 4 x 8, falling at 200px/s
  const above = () => game([{ x: 90, y: 100, w: 20, h: 10 }], { marchSpeed: 0, bombEvery: 0.5, bombSpeed: 200, bombW: 4, bombH: 8 });

  it("drop from an invader's bottom centre on the bomb timer", () => {
    let g = step(above(), none, 0.4);
    expect(g.bombs).toHaveLength(0);
    g = step(g, none, 0.1);
    expect(g.bombs).toEqual([{ x: 98, y: 110, w: 4, h: 8 }]);
  });

  it("a bomb on the ship costs a life and clears the bombs; the last life ends the game", () => {
    let g = step(above(), none, 0.5);
    expect(g.lives).toBe(3);
    // bomb from 110 reaches the ship top 264 within 0.8s
    for (let i = 0; i < 8; i++) g = step(g, none, 0.1);
    expect(g.lives).toBe(2);
    expect(g.bombs).toHaveLength(0);
    g = { ...g, lives: 1 };
    for (let i = 0; i < 14; i++) g = step(g, none, 0.1);
    expect(g.status).toBe("over");
  });
});

describe("invader sprites", () => {
  it("carry their kind and image source through play and into the next wave", () => {
    const g0 = createGame({
      field,
      invaders: [
        { kind: "word", label: "Evals", x: 90, y: 230, w: 20, h: 10 },
        { kind: "image", label: "A logo", src: "/logos/a.svg", x: 0, y: 0, w: 10, h: 10 },
      ],
      config: { shipW: 20, shipH: 16, shipGap: 20, bulletW: 2, bulletH: 8, bulletSpeed: 400, margin: 0, marchSpeed: 0, bombEvery: Infinity },
    });
    expect(g0.invaders.map((i) => [i.kind, i.label, i.src])).toEqual([
      ["word", "Evals", undefined],
      ["image", "A logo", "/logos/a.svg"],
    ]);
    // shoot the word, then the logo is the only one left; clear it by hand to start wave 2
    let g = step(step(g0, { fire: true }, 0.1), none, 0.1);
    expect(g.invaders.map((i) => i.kind)).toEqual(["image"]);
    g = step({ ...g, invaders: [] }, none, 0.1);
    expect(g.wave).toBe(2);
    expect(g.invaders.map((i) => [i.kind, i.src])).toEqual([
      ["word", undefined],
      ["image", "/logos/a.svg"],
    ]);
  });
});

describe("packFormation", () => {
  const f = { w: 400, h: 600 };
  const opts = { margin: 16, gap: 24, top: 48 };

  it("packs items into rows from the top left by default", () => {
    // gap 24, rows start at margin 16 and top 48; row height is the tallest item plus 16
    const items = [
      { label: "A", w: 150, h: 20 },
      { label: "B", w: 150, h: 20 },
      { label: "C", w: 150, h: 30 },
    ];
    expect(packFormation(items, f, opts).map((i) => [i.label, i.x, i.y])).toEqual([
      ["A", 16, 48],
      ["B", 190, 48],
      ["C", 16, 84],
    ]);
  });

  it("keeps rows within a width limit, so the formation has room to march", () => {
    const items = [
      { label: "A", w: 90, h: 20 },
      { label: "B", w: 90, h: 20 },
      { label: "C", w: 90, h: 20 },
    ];
    // 90 + 10 + 90 = 190 fits a 200 row; C starts a new row
    expect(packFormation(items, f, { ...opts, gap: 10, width: 200 }).map((i) => [i.x, i.y])).toEqual([
      [16, 48],
      [116, 48],
      [16, 84],
    ]);
  });

  it("centres the block in the field and each row in the block when asked", () => {
    const items = [
      { label: "A", w: 90, h: 20 },
      { label: "B", w: 90, h: 20 },
      { label: "C", w: 90, h: 20 },
    ];
    // widest row 190, block left (400 - 190) / 2 = 105; short row offset (190 - 90) / 2 = 50
    expect(packFormation(items, f, { ...opts, gap: 10, width: 200, centre: true }).map((i) => [i.x, i.y])).toEqual([
      [105, 48],
      [205, 48],
      [155, 84],
    ]);
  });

  it("shortens an item wider than a row to the row width", () => {
    expect(packFormation([{ label: "Wide", w: 500, h: 20 }], f, opts)[0].w).toBe(368);
  });

  it("leaves out rows that would pass half the field", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ label: `W${i}`, w: 300, h: 20 }));
    // rows at 48, 84, ... while y + 20 <= 300: 48 + 36 * 7 = 300 is the first row left out
    expect(packFormation(items, f, opts)).toHaveLength(7);
  });
});
