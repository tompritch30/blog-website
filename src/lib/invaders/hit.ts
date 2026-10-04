// What a hit on the mystery ship does to the game's screens (owner, 4 Oct 2026): the game pauses and
// offers the link it won as one focused "Open <label>" link, so a single Enter or click opens it in a
// new tab. The hit resolves inside the animation loop, frames after the key or tap that fired the
// shot, where a browser may block window.open; a real link the player activates is never blocked.
// Pure: Game.tsx owns the state and the storage.
import type { GameEvent, GameState, Status } from "./engine";
import { unlockedTargets, type MysteryTarget } from "./links";

export type AfterFrame = { mode: "paused"; offer: MysteryTarget } | { mode: "over"; offer: null } | null;

/**
 * The screen after one frame of play: game over if the last life went (a link won in the same frame
 * is on the game-over list), else paused on the first mystery-ship hit with its link offered, else
 * null to play on. Every hit offers its link, including once all three are won.
 */
export function afterFrame(events: readonly GameEvent[], status: Status): AfterFrame {
  if (status === "over") return { mode: "over", offer: null };
  const hit = events.find((e) => e.type === "mystery-hit");
  return hit ? { mode: "paused", offer: hit.target } : null;
}

/** The unlocked links to list under the offered one: all won, in the order won, minus the offer. */
export function listedBeside(unlocked: readonly string[], offer: MysteryTarget | null): MysteryTarget[] {
  return unlockedTargets(unlocked).filter((t) => t.href !== offer?.href);
}

/**
 * Test only, behind the `?invaders-test` query (no control on the site leads there): the mystery ship
 * centred over the player's ship and one shot just below it, above the formation, so the next frame
 * of play hits it. Lets scripts/check-pages.mts prove the hit-to-open flow in a real browser without
 * aiming. Never changes the game it is given.
 */
export function stageHit(g: GameState): GameState {
  const c = g.config;
  const centre = g.ship.x + g.ship.w / 2;
  return {
    ...g,
    mystery: { x: centre - c.mysteryW / 2, y: c.mysteryY, w: c.mysteryW, h: c.mysteryH, dir: 1 },
    bullets: [{ x: centre - c.bulletW / 2, y: c.mysteryY + c.mysteryH + 1, w: c.bulletW, h: c.bulletH }],
  };
}
