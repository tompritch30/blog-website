import { describe, expect, it } from "vitest";
import { draftBanner } from "./draft";

describe("draftBanner", () => {
  it("labels a draft, which only next dev renders, so a preview is never mistaken for the live post", () => {
    expect(draftBanner({ draft: true })).toBe("Draft. Shown by next dev only: not built, listed or in the feed.");
  });

  it("says nothing on a published post", () => {
    expect(draftBanner({ draft: false })).toBeNull();
  });
});
