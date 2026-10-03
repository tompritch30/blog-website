# Easter egg: prior art, then our own engine

Status: accepted, 3 Oct 2026.

The site hides a small Space Invaders-style game. The invaders are word blocks naming the things Thomas builds with (`src/components/invaders/words.ts`); the first version used the page's own headings, which the owner found flat (3 Oct). The owner asked for an existing MIT, CC0 or BSD game to be adopted if one is clean, before writing our own.

## Candidates (GitHub search, read 3 Oct 2026)

| Repo | Licence | Stars | Verdict |
|---|---|---|---|
| github.com/dwmkerr/spaceinvaders | MIT | 213 | Closest fit, but a mutable state machine on `setInterval` with global key state, sounds and fixed-size sprite invaders; adapting it to variable-width text invaders and a pure `step(state, input, dt)` rewrites every line. Its march rule (sideways, drop and reverse at an edge) is the classic one and we use the same rule. |
| github.com/maryrosecook/retro-games (space-invaders) | MIT | 68 | Tiny and clean, but frame-counted movement (no `dt`), each invader patrols on its own instead of marching as one, random fire from `Math.random`; no waves or score. |
| github.com/toivjon/html5-space-invaders | MIT | 8 | 2,400 lines in one file built around a sprite sheet PNG of the arcade art, which we may not ship. |
| github.com/victorqribeiro/invaderz | MIT | 710 | A genetic-algorithm twist: invaders evolve and wander randomly, not a formation march. |
| github.com/StrykerKKD/SpaceInvaders | MIT | 104 | Built on Phaser 2 and require.js; a game framework is far too heavy for a hidden page toy. |
| github.com/llaine/rxjs-space-invader | MIT | 16 | Needs RxJS and a webpack build; a learning project, not a reusable core. |
| github.com/pi0/space-invaders | none | 57 | Small and neat, but no licence, so it cannot be reused at all. |

## Decision

Write our own: `src/lib/invaders/engine.ts` (pure, tested with worked examples) and `src/components/invaders/Game.tsx` (canvas). The needs that ruled out adoption are specific to this site: invaders are word blocks of any width (with a typed hook for small image sprites later), the engine must be a pure function the tests can drive, and the game must load only on demand with no dependencies. No code was copied from any candidate. All pixel art (the alien trigger and the ship) is drawn from grids in our own code; see `design/MANIFEST.yaml`.

Why: vendoring a candidate would have meant keeping its licence and attribution for code we then replaced line by line.
