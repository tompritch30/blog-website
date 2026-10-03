Source: https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/implement
Licence: MIT, Copyright (c) 2026 Matt Pocock (full text in LICENSE in this folder)
Adapted: 2026-09-24. Upstream is a 15-line user-invoked skill (tdd at pre-agreed seams, typecheck and single tests often, full suite at the end, code-review, commit). This version keeps that spine, makes it model-invoked so builder agents can call it, and adds the repo's gates: short branch, ci per slice, one refute round, evidence in the plan's Log.
Copied into blog-website: 2026-10-03 from the Hazel adaptation.
Local note: the work spec is the plan file under `plans/`; evidence goes in its Log section and in commit messages. Branches are short `<type>-<slug>` names. Gates are `npm test` per change and `scripts/ci.sh` per slice. The owner pushes by hand; the agent never pushes.
