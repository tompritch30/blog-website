import Link from "next/link";
import { formatDate } from "@/lib/posts";
import type { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group py-6"
      style={{ borderBottom: "1px solid var(--divider)" }}
    >
      <div
        className="flex items-center gap-3 text-xs mb-2"
        style={{ color: "var(--secondary)" }}
      >
        <span>{formatDate(post.date)}</span>
        <span>·</span>
        <span>{post.readingTime}</span>
      </div>
      <h2
        className="text-base font-semibold tracking-tight mb-1.5 group-hover:opacity-70 transition-opacity"
        style={{ color: "var(--text)" }}
      >
        {post.title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: "var(--secondary)" }}>
        {post.description}
      </p>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-sm"
              style={{
                background: "var(--surface-soft)",
                color: "var(--secondary)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
