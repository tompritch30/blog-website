Source: https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/engineering/diagnosing-bugs
Licence: MIT, Copyright (c) 2026 Matt Pocock (full text in LICENSE in this folder)
Copied: 2026-09-24, verbatim except this file; upstream agents/openai.yaml (Codex metadata) not copied.
Copied into blog-website: 2026-10-03 from the Hazel adaptation.
Local note: the feedback loop is usually a Vitest test (`npm test`), a curl against `npm run dev`, or a headless-browser script. `scripts/hitl-loop.template.sh` is generic and kept as is. Record the confirmed hypothesis in the commit message and in the plan file's Log section.
