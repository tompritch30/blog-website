import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllPosts, getPost } from "./posts";

const fixtures = path.join(__dirname, "__fixtures__");
const dir = path.join(fixtures, "posts");

describe("getAllPosts", () => {
  it("lists published posts newest first and leaves drafts out", () => {
    const posts = getAllPosts({ dir, includeDrafts: false });
    expect(posts.map((p) => p.slug)).toEqual(["newer-post", "older-post"]);
    expect(posts[1]).toEqual({
      slug: "older-post",
      title: "An older post",
      date: "2026-01-05",
      description: "Written first.",
      draft: false,
      readingTime: "1 min read",
    });
  });

  it("ignores frontmatter keys it does not read, such as an old tags line, instead of carrying them onto the page", () => {
    // older-post.mdx still has `tags: ["notes"]`; tags are no longer shown anywhere (owner review, 4 Oct 2026).
    const older = getAllPosts({ dir, includeDrafts: false }).find((p) => p.slug === "older-post");
    expect(older).toBeDefined();
    expect(Object.keys(older!).sort()).toEqual(["date", "description", "draft", "readingTime", "slug", "title"]);
  });

  it("includes drafts when asked", () => {
    const posts = getAllPosts({ dir, includeDrafts: true });
    expect(posts.map((p) => p.slug)).toEqual(["unfinished-draft", "newer-post", "older-post"]);
  });

  it("names the file when a post has no title", () => {
    expect(() => getAllPosts({ dir: path.join(fixtures, "missing-title"), includeDrafts: true })).toThrow(
      /no-title\.mdx.*title/,
    );
  });

  it("rejects an unquoted YAML date, which would become a Date object", () => {
    expect(() => getAllPosts({ dir: path.join(fixtures, "unquoted-date"), includeDrafts: true })).toThrow(
      /bare-date\.mdx.*date/,
    );
  });

  it("names a file whose name is not a valid slug", () => {
    expect(() => getAllPosts({ dir: path.join(fixtures, "bad-slug"), includeDrafts: true })).toThrow(
      /My Post\.mdx.*lowercase/,
    );
  });
});

describe("getPost", () => {
  it("returns the metadata and body of a published post", () => {
    const post = getPost("older-post", { dir, includeDrafts: false });
    expect(post?.meta.title).toBe("An older post");
    expect(post?.content.trim()).toBe("Older body.");
  });

  it("hides a draft unless drafts are included", () => {
    expect(getPost("unfinished-draft", { dir, includeDrafts: false })).toBeNull();
    expect(getPost("unfinished-draft", { dir, includeDrafts: true })?.meta.draft).toBe(true);
  });

  it("returns null for an unknown slug or one that tries to leave the folder", () => {
    expect(getPost("no-such-post", { dir, includeDrafts: true })).toBeNull();
    expect(getPost("../missing-title/no-title", { dir, includeDrafts: true })).toBeNull();
  });
});

describe("the real posts folder", () => {
  it("parses every post, drafts included", () => {
    expect(getAllPosts({ includeDrafts: true }).length).toBeGreaterThan(0);
  });

  // Checks the rule, not today's content, so publishing a post (draft: false, docs/writing-a-post.md)
  // keeps CI green: production lists and routes every non-draft, and a draft only in `next dev`.
  it("publishes exactly the non-drafts, each routable, and keeps every draft previewable only", () => {
    const published = getAllPosts({ includeDrafts: false });
    const all = getAllPosts({ includeDrafts: true });
    for (const meta of published) {
      expect(meta.draft).toBe(false);
      expect(getPost(meta.slug, { includeDrafts: false })?.meta).toEqual(meta);
    }
    const drafts = all.filter((meta) => meta.draft);
    for (const meta of drafts) {
      expect(getPost(meta.slug, { includeDrafts: false })).toBeNull();
      expect(getPost(meta.slug, { includeDrafts: true })?.meta).toEqual(meta);
    }
    expect(published.length + drafts.length).toBe(all.length);
  });
});
