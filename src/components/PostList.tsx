import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { postPath } from "@/lib/paths";
import type { PostMeta } from "@/lib/posts";

// A plain list of links. The search box it used to have was a control without a job on a site
// with two posts (plans/site-v2.md, slice 4).
export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return <p className="py-6 text-sm text-secondary">No posts yet.</p>;
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug} className="flex items-baseline justify-between gap-4 border-b border-divider py-3.5">
          <Link href={postPath(post.slug)} className="min-w-0 text-sm font-medium text-fg hover:opacity-60">
            {post.title}
          </Link>
          <time dateTime={post.date} className="shrink-0 text-xs text-secondary">
            {formatDate(post.date)}
          </time>
        </li>
      ))}
    </ul>
  );
}
