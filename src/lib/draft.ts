import type { PostMeta } from "./posts";

/**
 * The line at the top of a draft. Only `next dev` renders drafts (ADR 0001), so a preview always says
 * it is one; a published post gets nothing.
 */
export function draftBanner(meta: Pick<PostMeta, "draft">): string | null {
  return meta.draft ? "Draft. Shown by next dev only: not built, listed or in the feed." : null;
}
