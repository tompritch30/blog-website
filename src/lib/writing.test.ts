import path from "node:path";
import { describe, expect, it } from "vitest";
import { writingIsLive } from "./writing";

const fixtures = path.join(__dirname, "__fixtures__");

describe("writingIsLive", () => {
  it("is true once at least one post is published, so the Writing link and the feed link show", () => {
    expect(writingIsLive({ dir: path.join(fixtures, "posts") })).toBe(true);
  });

  it("is false while every post is a draft, in next dev too, so nothing links to /writing", () => {
    expect(writingIsLive({ dir: path.join(fixtures, "drafts-only") })).toBe(false);
  });
});
