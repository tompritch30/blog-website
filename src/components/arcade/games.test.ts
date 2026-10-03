import { describe, expect, it } from "vitest";
import { type ArcadeGame, GAMES, gameToOpen } from "./games";

const fake = (id: string): ArcadeGame => ({ id, title: id, load: async () => ({ default: () => null }) });

describe("the arcade registry", () => {
  it("ships one game, Space Invaders, under a stable id and a sentence-case title", () => {
    expect(GAMES.map((g) => [g.id, g.title])).toEqual([["invaders", "Space invaders"]]);
  });

  it("loads the game only when asked, as the invaders component", async () => {
    const mod = await GAMES[0].load();
    const { default: Game } = await import("@/components/invaders/Game");
    expect(mod.default).toBe(Game);
  });

  it("opens the only game directly; with none, or with more than one (a picker comes later), opens nothing", () => {
    expect(gameToOpen(GAMES)?.id).toBe("invaders");
    expect(gameToOpen([])).toBeNull();
    expect(gameToOpen([fake("a"), fake("b")])).toBeNull();
  });
});
