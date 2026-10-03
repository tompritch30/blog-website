import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Mdx from "@/components/Mdx";
import { formatDate } from "@/lib/dates";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { postPath, WRITING_PATH } from "@/lib/paths";
import { getAllPosts, getPost } from "@/lib/posts";

// Only slugs from generateStaticParams exist; anything else, drafts included, is a 404.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const { slug, title, description, date, tags } = post.meta;
  return {
    title,
    description,
    alternates: { ...baseAlternates, canonical: postPath(slug) },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      url: postPath(slug),
      title,
      description,
      publishedTime: date,
      tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { meta, content } = post;

  return (
    <Container className="py-12 sm:py-16">
      <Link href={WRITING_PATH} className="mb-10 inline-block text-sm text-secondary hover:text-fg">
        All writing
      </Link>
      <article>
        <header className="mb-10">
          <p className="mb-3 flex items-center gap-2 text-xs text-secondary">
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{meta.readingTime}</span>
          </p>
          <h1 className="mb-4 text-2xl font-semibold leading-snug tracking-tight text-fg">{meta.title}</h1>
          {meta.tags.length > 0 && (
            <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
              {meta.tags.map((tag) => (
                <li key={tag} className="rounded-sm bg-surface-soft px-2 py-0.5 text-xs text-secondary">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>
        <Mdx source={content} />
      </article>
    </Container>
  );
}
