"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";
import { Search } from "lucide-react";

export default function PostList({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--muted)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-sm text-sm py-2 pl-8 pr-4 outline-none focus:ring-0"
          style={{
            background: "var(--surface-soft)",
            color: "var(--text)",
            border: "1px solid var(--divider)",
          }}
        />
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <p className="text-sm py-6" style={{ color: "var(--muted)" }}>
          No posts match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div>
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-baseline justify-between gap-4 group py-3.5"
              style={{ borderBottom: "1px solid var(--divider)" }}
            >
              <div className="min-w-0">
                <span
                  className="text-sm font-medium group-hover:opacity-60 transition-opacity block truncate"
                  style={{ color: "var(--text)" }}
                >
                  {post.title}
                </span>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-px rounded-sm"
                        style={{
                          background: "var(--surface-soft)",
                          color: "var(--secondary)",
                          border: "1px solid var(--divider)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span
                className="text-xs shrink-0"
                style={{ color: "var(--muted)" }}
              >
                {formatDate(post.date)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {query && filtered.length > 0 && (
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          {filtered.length} of {posts.length} posts
        </p>
      )}
    </div>
  );
}
