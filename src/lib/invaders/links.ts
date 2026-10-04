// What a hit on the mystery ship wins: a link added to the game's Unlocked list. The game never
// leaves the page or opens a tab on a hit (owner, 4 Oct 2026); the pause and game-over screens list
// the unlocked links for the player to open. Pure apart from the storage the caller passes in.
import { cv, links } from "@/content/profile";

export type MysteryTarget = { href: string; label: string };

export const MYSTERY_TARGETS: MysteryTarget[] = [
  { href: cv.publication.url, label: "ForestVO paper" },
  { href: links.github, label: "GitHub" },
  { href: links.linkedin, label: "LinkedIn" },
];

/** The target for the nth mystery hit (0-based), in rotation. */
export function mysteryTarget(n: number): MysteryTarget {
  const len = MYSTERY_TARGETS.length;
  return MYSTERY_TARGETS[((n % len) + len) % len];
}

/**
 * What the next mystery hit wins: the first target in rotation not yet in the unlocked list (kept
 * across games, so a returning player's first hit is not the paper again), or, once all are won,
 * the rotation by this game's hit count n.
 */
export const nextTarget = (unlocked: readonly string[], n: number): MysteryTarget =>
  MYSTERY_TARGETS.find((t) => !unlocked.includes(t.href)) ?? mysteryTarget(n);

/** The unlocked list with href added once, in the order the links were won. */
export const unlock = (list: readonly string[], href: string): string[] => (list.includes(href) ? [...list] : [...list, href]);

export const UNLOCKED_KEY = "invaders-unlocked";

type Store = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };

/**
 * The unlocked list kept from earlier games. Storage can throw on reaching it as well as on reading
 * (private windows, blocked site data), so the caller passes a getter; any failure reads as empty.
 */
export function readUnlocked(storage: () => Pick<Store, "getItem">): string[] {
  try {
    const parsed: unknown = JSON.parse(storage().getItem(UNLOCKED_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const known = new Set(MYSTERY_TARGETS.map((t) => t.href));
    return parsed.reduce<string[]>((list, href) => (typeof href === "string" && known.has(href) ? unlock(list, href) : list), []);
  } catch {
    return [];
  }
}

export function saveUnlocked(storage: () => Pick<Store, "setItem">, list: readonly string[]): void {
  try {
    storage().setItem(UNLOCKED_KEY, JSON.stringify(list));
  } catch {
    // nothing to do: the list lasts for this visit only
  }
}

/** The targets for an unlocked list, in its order. */
export const unlockedTargets = (list: readonly string[]): MysteryTarget[] =>
  list.map((href) => MYSTERY_TARGETS.find((t) => t.href === href)).filter((t): t is MysteryTarget => t !== undefined);
