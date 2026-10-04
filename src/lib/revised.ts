// The footer's "Revised" date: the day of the last commit, read once when the site is built, so it
// never goes stale by hand. Server-only (it runs git). Where the build has no git history (Vercel
// gives a commit SHA in its environment but no date), it falls back to the build day, which is the
// day the deployed pages were made.
import { execFileSync } from "node:child_process";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The committer date of HEAD as YYYY-MM-DD, or null when git or the history is missing. */
export function lastCommitDate(cwd?: string): string | null {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cs"], { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 5_000 }).trim();
  } catch {
    return null;
  }
}

/** The day to show: the last commit's date, else the build day (UTC). */
export function revisedDate(read: () => string | null = lastCommitDate, now: () => Date = () => new Date()): string {
  const day = read();
  return day && ISO_DAY.test(day) ? day : now().toISOString().slice(0, 10);
}
