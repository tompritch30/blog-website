import { describe, expect, it } from "vitest";
import { KONAMI, createTrigger, type TriggerKey } from "./trigger";

const key = (k: string, target: unknown = { tagName: "BODY" }, mods: Partial<TriggerKey> = {}): TriggerKey => ({
  key: k,
  target,
  ...mods,
});

function run(keys: TriggerKey[]) {
  let started = 0;
  const t = createTrigger(() => started++);
  keys.forEach((k) => t.handleKey(k));
  return started;
}

describe("createTrigger (Konami code)", () => {
  it("is up up down down left right left right b a", () => {
    expect(KONAMI).toEqual(["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]);
  });

  it("starts once on the full sequence", () => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(run(keys.map((k) => key(k)))).toBe(1);
  });

  it("accepts B and A typed with caps lock or shift", () => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "B", "A"];
    expect(run(keys.map((k) => key(k)))).toBe(1);
  });

  it("does not start on a broken sequence", () => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "x", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(run(keys.map((k) => key(k)))).toBe(0);
  });

  it("still starts when the visitor presses up one time too many first", () => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(run(keys.map((k) => key(k)))).toBe(1);
  });

  it("ignores keys typed in inputs, textareas, selects and contenteditable", () => {
    const fields = [{ tagName: "INPUT" }, { tagName: "TEXTAREA" }, { tagName: "SELECT" }, { tagName: "DIV", isContentEditable: true }];
    for (const target of fields) {
      const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
      expect(run(keys.map((k) => key(k, target)))).toBe(0);
    }
  });

  it("does not let typing in a field break a sequence typed on the page", () => {
    const page = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft"].map((k) => key(k));
    const typed = [key("q", { tagName: "INPUT" })];
    const rest = ["ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"].map((k) => key(k));
    expect(run([...page, ...typed, ...rest])).toBe(1);
  });

  it("ignores keys pressed with ctrl, meta or alt", () => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(run(keys.map((k, i) => key(k, undefined, i === 9 ? { ctrlKey: true } : {})))).toBe(0);
  });

  it("starts again after a second full sequence", () => {
    const once = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(run([...once, ...once].map((k) => key(k)))).toBe(2);
  });
});
