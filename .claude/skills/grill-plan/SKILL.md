---
name: grill-plan
description: Grill a builder's plan against the repo's docs before any code is written, agent to agent, one round, then decide. Use when a task or refactor has a written plan and nobody has interrogated it yet, or when the owner is not in the loop and a plan needs a second mind.
allowed-tools: Read, Grep, Glob, Bash, Write, Edit, Agent, Skill
---

# Grill plan

A fresh **griller** agent interrogates the **builder**'s plan against the docs, one round, before code. Then the plan is decided and building starts. This is the stand-in for a grilling session with the owner when the owner is not in the loop: the owner's side is played by the docs the owner already settled (`CLAUDE.md`, `CONTEXT.md`, `docs/adr/`, the code itself). With the owner present, call the Skill tool with "grilling" instead.

## 1. Builder writes the plan

A plan file in `plans/` (`plans/<slug>.md`), concise, grammar sacrificed for brevity:

- **Goal**: the task, quoted.
- **Why**: the user outcome it serves, so the griller can suggest alternatives.
- **Slices**: tracer bullets in order with blocking edges (split the work when it will not fit one fresh context).
- **Seams under test**: the public interfaces tests will drive, named in `CONTEXT.md` words.
- **Modules touched**: new or changed, with the interface each exposes.
- **Evidence**: the commands and screenshots that will prove done.
- **Open questions**: everything the builder is unsure of. An empty list is a red flag, not a win.

End the file with an empty `## Log` section; step 4 fills it. Then the builder returns the plan path to the lead and waits.

## 2. The lead spawns the griller

Spawning needs the Agent tool, which background builders do not have, so the lead does it. One fresh agent on the strongest available model (grilling runs on a frontier model's judgement), told to use only `Read, Grep, Glob` and read-only `git`. Pass the plan path, the docs list above, and this brief:

> Map the plan as a **design tree**: every decision branches into the ones that hang off it. Settle facts yourself by reading code and docs; ask for nothing you can look up. Walk the whole tree. Return: (a) the tree as one line per node: settled by `path:line`, settled by the plan, or open; (b) the open **frontier** as ONE round of at most 12 numbered questions, worst first, each with the doc line or code it rests on, your **recommended answer**, conditional answers for the nodes below it ("if rejected, Q5 becomes ..."), and a class: **blocker** (contradicts a doc, ADR, guardrail or acceptance test), **should** (weaker than the docs allow), **owner** (a product, taste or scope choice the docs do not settle) with `reversible: yes/no`. Check: slices vertical and each fits one fresh context; tests only at the named seams; modules deep; every acceptance test in the plan has a planned proof. With zero blockers, list each acceptance test you checked. Under 700 words.

## 3. Decide, once

One line per question: **accept**, **reject** with the reason, or **park** (owner class only). The builder decides should-class questions; the lead decides any rejected blocker. No second round: a standing blocker changes the plan or stops the task. An owner question marked `reversible: yes` is built on the recommended answer and logged as a default; `reversible: no` stops the task until the owner answers.

## 4. Record

Append to the `## Log` section at the bottom of the plan file: questions asked, accepted, rejected with reasons, parked. Parked items go under **For the owner**, each with the recommended answer and the cost of reversing it. New terms go to `CONTEXT.md` and qualifying decisions to `docs/adr/` (call the Skill tool with "domain-modeling").

Done when every question has a decision line and the Log entry exists. Then build (call the Skill tool with "implement").

## Learnings

Add a dated line here the same day this skill misfires, and turn it into a check if it repeats.
