import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      {/* Bio */}
      <div className="mb-12">
        <p
          className="text-xl font-semibold tracking-tight mb-1"
          style={{ color: "var(--text)" }}
        >
          {/* TODO: your name */}
          Tom
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--secondary)" }}>
          {/*
           * TODO: one or two lines about what you build / care about.
           */}
          Building tools that automate tedious things. Writing about the decisions behind them.
        </p>
      </div>

      {/* Posts */}
      <PostList posts={posts} />
    </div>
  );
}
