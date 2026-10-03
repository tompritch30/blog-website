// Original pixel art for the hidden game, drawn for this site (design/MANIFEST.yaml).
// "#" is a filled pixel, "." is empty.

export { ALIEN, ALIEN_LOOK, cells, gridPath } from "./alien";

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

// Invader type 3, the top row: a beetle with its shell marked "VO" (the ForestVO paper) in
// our own 3 x 5 pixel letters. Frame 1 has its arms up and antennae in; frame 2 the reverse.
const BEETLE_A = [
  "..#.......#..",
  "...#.....#...",
  ".###########.",
  "###.#.#...###",
  ".##.#.#.#.##.",
  ".##.#.#.#.##.",
  ".##.#.#.#.##.",
  ".###.##...##.",
  ".###########.",
  "..#.#...#.#..",
  ".#.........#.",
];
const BEETLE_B = [
  ".#.........#.",
  "..#.......#..",
  ".###########.",
  ".##.#.#...##.",
  ".##.#.#.#.##.",
  ".##.#.#.#.##.",
  "###.#.#.#.###",
  ".###.##...##.",
  ".###########.",
  "..#.#...#.#..",
  "...#.....#...",
];

// Invader type 2, the middle rows: a domed drifter with one antenna and a fringed skirt,
// marked "IC" (Imperial College) in the same pixel letters. The skirt and antenna sway.
const DRIFTER_A = [
  "......#......",
  ".....###.....",
  "...#######...",
  "..#########..",
  ".###.#...###.",
  ".###.#.#####.",
  ".###.#.#####.",
  ".###.#.#####.",
  ".###.#...###.",
  "#############",
  "#..#..#..#..#",
];
const DRIFTER_B = [
  ".......#.....",
  ".....###.....",
  "...#######...",
  "..#########..",
  ".###.#...###.",
  ".###.#.#####.",
  ".###.#.#####.",
  ".###.#.#####.",
  ".###.#...###.",
  "#############",
  ".#..#.#.#..#.",
];

// Type 1 (the bottom rows) is the Palindrome mark, an image sprite (public/logos/palindrome.svg).
export const CREATURES: Record<2 | 3, [string[], string[]]> = {
  2: [DRIFTER_A, DRIFTER_B],
  3: [BEETLE_A, BEETLE_B],
};

// A shield: a stepped dome with a doorway, eroded cell by cell in play.
export const SHIELD = [
  "......########......",
  "....############....",
  "..################..",
  ".##################.",
  "####################",
  "####################",
  "####################",
  "####################",
  "####################",
  "#######......#######",
  "######........######",
  "######........######",
];

// The mystery ship: a golden airship with tail fins and a gondola, nose to the left.
export const MYSTERY = [
  "....##########....",
  "..##############.#",
  ".#################",
  ".#################",
  "..##############.#",
  "....##########....",
  ".......####.......",
];
