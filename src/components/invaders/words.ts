// The invaders: the tech Thomas has shipped and the work he is proud of, in formation order.
// Edit freely. A word is drawn as a block of text in the page's font and colours.
//
// Image sprites are a hook for later (for example a row of small monochrome organisation logos):
// `{ kind: "image", label: "Name for screen readers", src: "/invaders/name.svg" }`. Nothing
// here is fetched until an image entry is added, and none is yet.
import type { SpriteKind } from "@/lib/invaders/engine";

export type InvaderSprite = { kind: SpriteKind; label: string; src?: string };

const words = [
  "Agents",
  "Evals",
  "RAG",
  "LLM-as-judge",
  "Prompt caching",
  "PydanticAI",
  "Claude Code",
  "FastAPI",
  "Azure",
  "Guardrails",
  "Human-in-the-loop",
  "WhatsApp agent",
  "Call QA",
  "Transcription",
  "ForestVO",
  "IEEE RA-L",
];

export const INVADERS: InvaderSprite[] = words.map((label) => ({ kind: "word", label }));
