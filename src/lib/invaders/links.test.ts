import { describe, expect, it } from "vitest";
import { MYSTERY_TARGETS, UNLOCKED_KEY, mysteryTarget, nextTarget, readUnlocked, saveUnlocked, unlock } from "./links";

const PAPER = "https://doi.org/10.1109/lra.2025.3557738";
const GITHUB = "https://github.com/tompritch30";
const LINKEDIN = "https://www.linkedin.com/in/thomas-pritchard-01a/";

describe("mystery ship link targets", () => {
  it("are the paper, GitHub and LinkedIn, each named in sentence case", () => {
    expect(MYSTERY_TARGETS.map((t) => [t.href, t.label])).toEqual([
      [PAPER, "ForestVO paper"],
      [GITHUB, "GitHub"],
      [LINKEDIN, "LinkedIn"],
    ]);
  });

  it("rotate: the nth hit wins target n, paper, GitHub, LinkedIn, then round again", () => {
    expect([0, 1, 2, 3, 4].map((n) => mysteryTarget(n).href)).toEqual([PAPER, GITHUB, LINKEDIN, PAPER, GITHUB]);
  });
});

describe("nextTarget", () => {
  it("is the first target in rotation not yet won, whatever this game's hit count, so a returning player wins something new", () => {
    expect(nextTarget([], 0).href).toBe(PAPER);
    expect(nextTarget([], 2).href).toBe(PAPER);
    expect(nextTarget([PAPER], 0).href).toBe(GITHUB);
    expect(nextTarget([GITHUB], 0).href).toBe(PAPER);
    expect(nextTarget([PAPER, LINKEDIN], 1).href).toBe(GITHUB);
  });

  it("keeps rotating by hit count once all three are won", () => {
    expect([0, 1, 2, 3].map((n) => nextTarget([LINKEDIN, PAPER, GITHUB], n).href)).toEqual([PAPER, GITHUB, LINKEDIN, PAPER]);
  });
});

describe("unlock", () => {
  it("adds a hit's target to the unlocked list once, in the order they were won", () => {
    const one = unlock([], PAPER);
    expect(one).toEqual([PAPER]);
    expect(unlock(one, PAPER)).toEqual([PAPER]);
    expect(unlock(one, LINKEDIN)).toEqual([PAPER, LINKEDIN]);
    expect(one).toEqual([PAPER]);
  });
});

// A stand-in for localStorage that keeps what it is given.
function memory() {
  const data = new Map<string, string>();
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
}

describe("the stored unlocked list", () => {
  it("round-trips through storage, so it survives a replay or a reload", () => {
    const s = memory();
    saveUnlocked(() => s, [GITHUB, PAPER]);
    expect(s.data.get(UNLOCKED_KEY)).toBe(JSON.stringify([GITHUB, PAPER]));
    expect(readUnlocked(() => s)).toEqual([GITHUB, PAPER]);
  });

  it("reads nothing from an empty, corrupt or foreign value, keeping only known targets once", () => {
    const s = memory();
    expect(readUnlocked(() => s)).toEqual([]);
    s.data.set(UNLOCKED_KEY, "{not json");
    expect(readUnlocked(() => s)).toEqual([]);
    s.data.set(UNLOCKED_KEY, JSON.stringify({ a: 1 }));
    expect(readUnlocked(() => s)).toEqual([]);
    s.data.set(UNLOCKED_KEY, JSON.stringify(["https://evil.example/", LINKEDIN, 7, LINKEDIN]));
    expect(readUnlocked(() => s)).toEqual([LINKEDIN]);
  });

  it("survives storage that throws, on reaching it, reading or writing", () => {
    const gone = () => {
      throw new Error("SecurityError");
    };
    expect(readUnlocked(gone)).toEqual([]);
    expect(() => saveUnlocked(gone, [PAPER])).not.toThrow();
    const broken = { getItem: gone, setItem: gone };
    expect(readUnlocked(() => broken)).toEqual([]);
    expect(() => saveUnlocked(() => broken, [PAPER])).not.toThrow();
  });
});
