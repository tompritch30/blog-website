import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { postPath } from "@/lib/paths";
import type { PostMeta } from "@/lib/posts";

// Posts between hairlines: the date and reading time, the title as the link, then its description.
// The reference's topic pills are left out, and so are tags. `heading` is the title's level,
// so the list sits under the page's h1 (/writing) or a section's h2 (home).
export default function PostList({ posts, heading = "h2" }: { posts: PostMeta[]; heading?: "h2" | "h3" }) {
  if (posts.length === 0) return <p>No posts yet.</p>;
  const Title = heading;
  return (
    <ul className="posts">
      {posts.map((post) => (
        <li key={post.slug}>
          <p className="post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime}
          </p>
          <Title className="post-title">
            <Link href={postPath(post.slug)}>{post.title}</Link>
          </Title>
          <p className="post-description">{post.description}</p>
        </li>
      ))}
    </ul>
  );
}
