import { describe, expect, it } from "vitest";
import { ALIEN, ALIEN_LOOK, SHIP, cells, gridPath } from "./sprites";

describe("pixel grids", () => {
  it("are rectangular and use only # and .", () => {
    for (const grid of [ALIEN, ALIEN_LOOK, SHIP]) {
      expect(new Set(grid.map((row) => row.length)).size).toBe(1);
      expect(grid.join("")).toMatch(/^[#.]+$/);
    }
  });

  it("the alien looks aside on hover: only the eye row changes", () => {
    const changed = ALIEN.map((row, i) => (row === ALIEN_LOOK[i] ? null : i)).filter((i) => i !== null);
    expect(changed).toHaveLength(1);
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
