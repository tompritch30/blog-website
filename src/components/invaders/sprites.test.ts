import { describe, expect, it } from "vitest";
import { ALIEN, ALIEN_LOOK, CREATURES, MYSTERY, SHIELD, SHIP, cells, gridPath } from "./sprites";

const all = [ALIEN, ALIEN_LOOK, SHIP, SHIELD, MYSTERY, ...CREATURES[2], ...CREATURES[3]];

describe("pixel grids", () => {
  it("are rectangular and use only # and .", () => {
    for (const grid of all) {
      expect(new Set(grid.map((row) => row.length)).size).toBe(1);
      expect(grid.join("")).toMatch(/^[#.]+$/);
    }
  });

  it("the alien looks aside on hover: only the eye row changes", () => {
    const changed = ALIEN.map((row, i) => (row === ALIEN_LOOK[i] ? null : i)).filter((i) => i !== null);
    expect(changed).toHaveLength(1);
  });

  it("each pixel creature has two frames of the same size that differ, so it steps as it marches", () => {
    for (const type of [2, 3] as const) {
      const [a, b] = CREATURES[type];
      expect([b.length, b[0].length]).toEqual([a.length, a[0].length]);
      expect(a).not.toEqual(b);
    }
  });

  it("the two creature types share one size, so the formation's cells line up", () => {
    expect([CREATURES[2][0].length, CREATURES[2][0][0].length]).toEqual([CREATURES[3][0].length, CREATURES[3][0][0].length]);
  });

  it("cells lists each filled pixel as column and row", () => {
    expect(cells(["#.", ".#"])).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("gridPath draws one unit square per filled pixel", () => {
    expect(gridPath(["#.", ".#"])).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
  });
});
