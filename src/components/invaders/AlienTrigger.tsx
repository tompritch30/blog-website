"use client";

// The way into the arcade: a tiny pixel alien a curious visitor can find. A real button whose one
// job is to start the game; with one game in the arcade (src/components/arcade/games.ts) it opens
// that game directly. The game itself loads only when it is pressed.
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { GAMES, gameToOpen, type GameProps } from "@/components/arcade/games";
import { createTrigger } from "@/lib/invaders/trigger";
import { ALIEN, ALIEN_LOOK, gridPath } from "./alien";

type GameComponent = ComponentType<GameProps>;

const IDLE = gridPath(ALIEN);
const LOOK = gridPath(ALIEN_LOOK);

// One game at a time, however many aliens a page carries.
let running = false;

/** Calls onStart when the visitor types the Konami code outside a text field. */
export function useKonami(onStart: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const trigger = createTrigger(onStart);
    const onKey = (e: KeyboardEvent) => trigger.handleKey(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart, enabled]);
}

export default function AlienTrigger({ konami = false, className = "" }: { konami?: boolean; className?: string }) {
  const [Game, setGame] = useState<GameComponent | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const start = useCallback((from: HTMLElement | null) => {
    const game = gameToOpen(GAMES);
    if (running || !game) return;
    running = true;
    returnTo.current = from;
    game
      .load()
      .then((m) => setGame(() => m.default))
      .catch(() => {
        running = false;
      });
  }, []);

  const close = useCallback(() => {
    setGame(null);
    running = false;
    const to = returnTo.current;
    // after the game unmounts and the page is put back
    requestAnimationFrame(() => to?.focus());
  }, []);

  const fromKeys = useCallback(
    () => start(document.activeElement instanceof HTMLElement ? document.activeElement : null),
    [start],
  );
  useKonami(fromKeys, konami);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Play space invaders"
        onClick={() => start(buttonRef.current)}
        className={`group inline-flex h-7 w-7 items-center justify-center text-secondary hover:text-fg focus-visible:text-fg ${className}`}
      >
        <svg viewBox="0 0 11 8" width="22" height="16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
          <path d={IDLE} className="group-hover:hidden group-focus-visible:hidden" />
          <path d={LOOK} className="hidden group-hover:inline group-focus-visible:inline" />
        </svg>
      </button>
      {Game && <Game onClose={close} />}
    </>
  );
}
