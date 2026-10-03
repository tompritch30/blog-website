// Original pixel art for the hidden game, drawn for this site (design/MANIFEST.yaml).
// "#" is a filled pixel, "." is empty.

// A round-headed alien with a bent antenna and four short legs. Its eyes are the gaps in row 4.
export const ALIEN = [
  "......#....",
  ".....#.....",
  "...#####...",
  "..#######..",
  ".##.##.###.",
  ".#########.",
  "..#######..",
  "..#.#.#.#..",
];

// The same alien glancing to the side: the hover and focus hint.
export const ALIEN_LOOK = [
  "......#....",
  ".....#.....",
  "...#####...",
  "..#######..",
  ".###.##.##.",
  ".#########.",
  "..#######..",
  "..#.#.#.#..",
];

// The player's ship: a winged dart.
export const SHIP = [
  "......#......",
  ".....###.....",
  ".....###.....",
  "....#####....",
  ".#..#####..#.",
  ".###########.",
  "#############",
  "##...###...##",
];

/** Filled pixels as [column, row]. */
export function cells(grid: string[]): [number, number][] {
  const out: [number, number][] = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") out.push([x, y]);
  });
  return out;
}

/** An SVG path of unit squares, for a viewBox of the grid's size. */
export function gridPath(grid: string[]): string {
  return cells(grid)
    .map(([x, y]) => `M${x} ${y}h1v1h-1z`)
    .join("");
}
