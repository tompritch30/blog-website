// The game's held input (keys, a tap, a drag target) as pure updates, so Game.tsx can let go of
// everything whenever play stops: a key released while the game is paused or over would otherwise
// still read as held on resume (review round 3).

export type HeldInput = { left: boolean; right: boolean; fire: boolean; tap: boolean; targetX: number | null };

/** Input with nothing held: no keys, no tap, no drag target. A fresh object each call. */
export function releasedInput(): HeldInput {
  return { left: false, right: false, fire: false, tap: false, targetX: null };
}

/**
 * The input after one key event, or null when the game does not take the key. Presses count only
 * while playing; releases count in any mode. Space on a focused button or link belongs to that
 * control, but its release still lets go of fire. Never changes the input it is given.
 */
export function keyInput(i: HeldInput, key: string, down: boolean, o: { playing: boolean; onControl: boolean }): HeldInput | null {
  if (down && !o.playing) return null;
  const k = key.toLowerCase();
  if (k === "arrowleft" || k === "a") return { ...i, left: down, targetX: null };
  if (k === "arrowright" || k === "d") return { ...i, right: down, targetX: null };
  if (k === " " && (!down || !o.onControl)) return { ...i, fire: down };
  return null;
}
