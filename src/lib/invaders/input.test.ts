import { describe, expect, it } from "vitest";
import { keyInput, releasedInput, type HeldInput } from "./input";

const idle: HeldInput = { left: false, right: false, fire: false, tap: false, targetX: null };
const held: HeldInput = { left: true, right: true, fire: true, tap: true, targetX: 120 };

describe("releasedInput", () => {
  it("lets go of every key, the tap and the drag target, so nothing is still held after a pause", () => {
    expect(releasedInput()).toEqual(idle);
  });

  it("gives a fresh object each time, so one game's input never leaks into the next", () => {
    const a = releasedInput();
    a.left = true;
    expect(releasedInput()).toEqual(idle);
  });
});

describe("keyInput", () => {
  it("presses and releases the arrows and A and D while playing; a key press drops the drag target", () => {
    expect(keyInput(held, "ArrowLeft", false, { playing: true, onControl: false })).toEqual({ ...held, left: false, targetX: null });
    expect(keyInput(idle, "a", true, { playing: true, onControl: false })).toEqual({ ...idle, left: true });
    expect(keyInput(idle, "D", true, { playing: true, onControl: false })).toEqual({ ...idle, right: true });
    expect(keyInput(idle, " ", true, { playing: true, onControl: false })).toEqual({ ...idle, fire: true });
  });

  it("ignores key presses outside play, but applies key releases in any mode, so a key let go while paused is up on resume", () => {
    expect(keyInput(idle, "ArrowRight", true, { playing: false, onControl: false })).toBeNull();
    expect(keyInput(idle, " ", true, { playing: false, onControl: false })).toBeNull();
    expect(keyInput(held, "ArrowRight", false, { playing: false, onControl: false })).toEqual({ ...held, right: false, targetX: null });
    expect(keyInput(held, " ", false, { playing: false, onControl: false })).toEqual({ ...held, fire: false });
  });

  it("leaves space on a focused button or link to that control, but still lets go of fire when space comes up there", () => {
    expect(keyInput(idle, " ", true, { playing: true, onControl: true })).toBeNull();
    expect(keyInput(held, " ", false, { playing: false, onControl: true })).toEqual({ ...held, fire: false });
  });

  it("returns null for any other key and never changes the input it was given", () => {
    expect(keyInput(held, "x", true, { playing: true, onControl: false })).toBeNull();
    expect(keyInput(held, "Enter", false, { playing: true, onControl: false })).toBeNull();
    keyInput(held, "ArrowLeft", false, { playing: true, onControl: false });
    expect(held).toEqual({ left: true, right: true, fire: true, tap: true, targetX: 120 });
  });
});
