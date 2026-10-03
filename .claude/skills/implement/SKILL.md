---
name: implement
description: Build one task or slice from its grilled plan, test-first, through the repo gates to a local commit. Use when a plan has passed grill-plan and it is time to write code.
allowed-tools: Read, Grep, Glob, Bash, Write, Edit, Skill
---

Implement the work described in the plan file in `plans/` and its grilled plan.

1. **Branch**: `<type>-<slug>` (for example `feat-rss-feed`, `fix-date-format`) from a green `main`. Read `CONTEXT.md`, the ADRs in the area, and the modules you touch in the code.
2. **Slices**: one tracer bullet at a time, in the plan's order. Each slice goes red then green: call the Skill tool with "tdd". The grilled plan's seams count as the confirmed seams; test there and nowhere else.
3. **Loop tight**: typecheck and the single test file after every change; the full `scripts/ci.sh` once per slice. A slice is done when its test is green and `scripts/ci.sh` is green.
4. **Oracles**: expected values come from ground truth, a worked example, or goldens made by another agent.
5. **Commit** each green slice: Conventional Commit, body says why. Nothing is pushed; the owner pushes by hand.
6. **Review**: when every slice is green, report the branch to the lead, who runs `code-review` (fixed point = the branch base, spec = the plan file) in fresh sub-agents that did not write the code. A builder that holds the Agent tool may call the Skill tool with "code-review" itself.
7. **Decide**: fix every Spec finding and every hard Standards finding; for judgement calls, fix or write one line on why not. One refute round, then the lead decides.
8. **Evidence**: append to the `## Log` section at the bottom of the plan file the commands run with their output tail, screenshot paths, the review summary, and anything parked for the owner. A finding that could recur becomes a lint or test in the same branch.

Done when every acceptance test in the plan has its proof in the Log.

## Learnings

Add a dated line here the same day this skill misfires, and turn it into a check if it repeats.
