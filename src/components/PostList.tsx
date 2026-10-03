"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { postPath } from "@/lib/paths";
import type { PostMeta } from "@/lib/posts";

function matches(post: PostMeta, query: string): boolean {
  return [post.title, post.description, ...post.tags].some((text) => text.toLowerCase().includes(query));
}

export default function PostList({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");
  const q = query.toLowerCase().trim();
  const shown = useMemo(() => (q ? posts.filter((p) => matches(p, q)) : posts), [posts, q]);

  return (
    <div>
      <div className="relative mb-8">
        <label htmlFor="post-search" className="sr-only">
          Search posts
        </label>
        <Search
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
        />
        <input
          id="post-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts"
          className="w-full rounded-sm border border-divider bg-surface-soft py-2 pl-8 pr-4 text-sm text-fg placeholder:text-secondary"
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {q ? `${shown.length} of ${posts.length} posts match` : ""}
      </p>

      {shown.length === 0 ? (
        <p className="py-6 text-sm text-secondary">
          {posts.length === 0 ? "No posts yet." : <>No posts match &ldquo;{query}&rdquo;.</>}
        </p>
      ) : (
        <ul>
          {shown.map((post) => (
            <li key={post.slug} className="flex items-baseline justify-between gap-4 border-b border-divider py-3.5">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-fg">
                  <Link href={postPath(post.slug)} className="hover:opacity-60">
                    {post.title}
                  </Link>
                </h3>
                {post.tags.length > 0 && (
                  <ul aria-label="Tags" className="mt-1 flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-sm border border-divider bg-surface-soft px-1.5 py-px text-xs text-secondary"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <time dateTime={post.date} className="shrink-0 text-xs text-secondary">
                {formatDate(post.date)}
              </time>
            </li>
          ))}
        </ul>
      )}

      {q && shown.length > 0 && (
        <p aria-hidden="true" className="mt-4 text-xs text-secondary">
          {shown.length} of {posts.length} posts
        </p>
      )}
    </div>
  );
}
