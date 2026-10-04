import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lastCommitDate, revisedDate } from "./revised";

const at = (iso: string) => () => new Date(iso);

describe("revisedDate", () => {
  it("is the last commit's date when git gives one", () => {
    expect(revisedDate(() => "2026-10-04", at("2026-12-25T10:00:00Z"))).toBe("2026-10-04");
  });

  it("falls back to the build day when git is not there (a build without the repo's history)", () => {
    expect(revisedDate(() => null, at("2026-11-02T23:30:00Z"))).toBe("2026-11-02");
  });

  it("falls back to the build day when git answers with something that is not a date", () => {
    expect(revisedDate(() => "", at("2026-11-02T08:00:00Z"))).toBe("2026-11-02");
    expect(revisedDate(() => "fatal: your current branch has no commits", at("2026-11-02T08:00:00Z"))).toBe("2026-11-02");
  });
});

describe("lastCommitDate", () => {
  it("reads this repository's last commit date, as git itself prints it", () => {
    const expected = execFileSync("git", ["log", "-1", "--format=%cs"], { encoding: "utf-8" }).trim();
    expect(expected).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(lastCommitDate()).toBe(expected);
  });

  it("gives null outside a git repository instead of throwing", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "revised-"));
    // a git hook (this suite runs in pre-commit) points git at the repo through GIT_DIR; a build does not
    const saved = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("GIT_")));
    for (const k of Object.keys(saved)) delete process.env[k];
    try {
      expect(lastCommitDate(dir)).toBeNull();
    } finally {
      Object.assign(process.env, saved);
      fs.rmSync(dir, { recursive: true });
    }
  });
});
