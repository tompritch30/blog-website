import { describe, expect, it } from "vitest";
import { createGame, step, type GameEvent } from "./engine";
import { afterFrame, listedBeside, stageHit } from "./hit";
import { MYSTERY_TARGETS } from "./links";

const [paper, github, linkedin] = MYSTERY_TARGETS;
const hit = (target = paper, newLink = true): GameEvent => ({ type: "mystery-hit", target, points: 100, newLink });

describe("afterFrame: what a frame of play leads to", () => {
  it("plays on when nothing happened", () => {
    expect(afterFrame([], "playing")).toBeNull();
  });

  it("pauses on a mystery-ship hit and offers the link it won, to open in a new tab", () => {
    expect(afterFrame([hit(paper)], "playing")).toEqual({ mode: "paused", offer: paper });
  });

  it("offers the link on every hit, even once all three are won and the hit wins no new one", () => {
    expect(afterFrame([hit(github, false)], "playing")).toEqual({ mode: "paused", offer: github });
  });

  it("ends the game when the last life goes in the same frame as a hit; the won link is on the game-over list", () => {
    expect(afterFrame([hit(linkedin)], "over")).toEqual({ mode: "over", offer: null });
    expect(afterFrame([], "over")).toEqual({ mode: "over", offer: null });
  });
});

describe("listedBeside: the unlocked list under the offered link", () => {
  it("leaves out the offered link, so the screen links each place once, and keeps the order won", () => {
    expect(listedBeside([linkedin.href, paper.href, github.href], paper).map((t) => t.label)).toEqual(["LinkedIn", "GitHub"]);
  });

  it("lists every won link when nothing is offered (a pause by hand, or game over)", () => {
    expect(listedBeside([paper.href, github.href], null)).toEqual([paper, github]);
  });
});

describe("stageHit: the test-only hit behind ?invaders-test", () => {
  const field = { w: 300, h: 400 };
  // one invader straight above the ship, between it and the top, as in a real formation
  const g = createGame({
    field,
    invaders: [{ x: 140, y: 120, w: 20, h: 16, type: 1, row: 0, col: 0 }],
    config: { shipW: 30, shipH: 10, mysteryW: 40, mysteryH: 12, mysteryY: 60, mysterySpeed: 50, mysteryEvery: Infinity },
  });

  it("puts the mystery ship over the player's ship with a shot just below it, above the formation", () => {
    const s = stageHit(g);
    const centre = g.ship.x + g.ship.w / 2;
    expect(s.mystery).toMatchObject({ y: 60, w: 40, h: 12 });
    expect(s.mystery!.x + s.mystery!.w / 2).toBe(centre);
    expect(s.bullets).toHaveLength(1);
    expect(s.bullets[0].x + s.bullets[0].w / 2).toBe(centre);
    expect(s.bullets[0].y).toBeGreaterThan(60 + 12);
    expect(s.bullets[0].y + s.bullets[0].h).toBeLessThan(120);
  });

  it("hits on the next frame of play: the first link not yet won, 100 points, the invader untouched", () => {
    const after = step(stageHit(g), {}, 0.016);
    expect(after.events).toEqual([{ type: "mystery-hit", target: paper, points: 100, newLink: true }]);
    expect(after.score).toBe(100);
    expect(after.invaders).toHaveLength(1);
  });

  it("never changes the game it is given", () => {
    const before = JSON.stringify(g);
    stageHit(g);
    expect(JSON.stringify(g)).toBe(before);
  });
});
