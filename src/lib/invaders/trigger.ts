// The Konami code as a bonus way into the hidden game. Pure: the caller feeds it key events.
export const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export type TriggerKey = {
  key: string;
  target?: unknown;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

const TEXT_ENTRY = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** True for a field the visitor types into, where arrow keys and letters belong to the field. */
export function isTextEntry(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const t = target as { tagName?: unknown; isContentEditable?: unknown };
  return (typeof t.tagName === "string" && TEXT_ENTRY.has(t.tagName.toUpperCase())) || t.isContentEditable === true;
}

export function createTrigger(onStart: () => void, sequence: string[] = KONAMI) {
  let recent: string[] = [];
  return {
    handleKey(e: TriggerKey) {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        recent = [];
        return;
      }
      if (isTextEntry(e.target)) return;
      // keep the last N keys and compare, so "up up up down ..." still matches
      recent = [...recent, e.key.toLowerCase()].slice(-sequence.length);
      if (recent.length === sequence.length && recent.every((k, i) => k === sequence[i])) {
        recent = [];
        onStart();
      }
    },
    reset() {
      recent = [];
    },
  };
}
