import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { getAllPosts, getPost, formatDate } from "@/lib/posts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getPost(slug);
    return {
      title: meta.title,
      description: meta.description,
    };
  } catch {
    return {};
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;

  let post;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }

  const { meta, content } = post;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-60"
        style={{ color: "var(--secondary)" }}
      >
        <ArrowLeft size={14} />
        All posts
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div
          className="flex items-center gap-2 text-xs mb-3"
          style={{ color: "var(--secondary)" }}
        >
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          <span>·</span>
          <span>{meta.readingTime}</span>
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight leading-snug mb-4"
          style={{ color: "var(--text)" }}
        >
          {meta.title}
        </h1>
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag: string) => (
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
      </header>

      {/* Body */}
      <article className="prose prose-zinc max-w-none">
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight, rehypeSlug],
            },
          }}
        />
      </article>
    </div>
  );
}
