import type { ComponentType } from "react";

// The arcade: the games the pixel alien (and the Konami code) can open. Each game is its own lazy
// chunk, loaded by `load` only when a visitor opens it. One game ships now; with one game the alien
// opens it directly, and a picker can come when a second game does.

export type GameProps = { onClose: () => void };
export type ArcadeGame = { id: string; title: string; load: () => Promise<{ default: ComponentType<GameProps> }> };

export const GAMES: ArcadeGame[] = [
  { id: "invaders", title: "Space invaders", load: () => import("@/components/invaders/Game") },
];

/** The game the alien opens: the only one when there is exactly one, else none (no picker yet). */
export function gameToOpen(games: ArcadeGame[]): ArcadeGame | null {
  return games.length === 1 ? games[0] : null;
}
