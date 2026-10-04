import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  draft: boolean;
  readingTime: string;
};

export type Post = { meta: PostMeta; content: string };

type Options = {
  dir?: string;
  // Drafts are visible in `next dev` so they can be previewed, and nowhere else.
  includeDrafts?: boolean;
};

// `dir` is a variable, so Turbopack would trace the whole project into the server output;
// the turbopackIgnore comments below stop that. Every page that reads posts is prerendered.
const DEFAULT_DIR = path.join(process.cwd(), "src/content/posts");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function resolve(options: Options): Required<Options> {
  return {
    dir: options.dir ?? DEFAULT_DIR,
    includeDrafts: options.includeDrafts ?? process.env.NODE_ENV === "development",
  };
}

function invalid(file: string, problem: string): never {
  throw new Error(`${file}: ${problem}`);
}

// Reads only the keys it knows; any other key (an old `tags` line, say) is left behind, not carried onto
// the page.
function parseFrontmatter(data: Record<string, unknown>, file: string): Omit<PostMeta, "slug" | "readingTime"> {
  const { title, date, description, draft = false } = data;
  if (typeof title !== "string" || !title.trim()) invalid(file, "frontmatter needs a non-empty title");
  if (date instanceof Date) invalid(file, 'frontmatter date must be quoted, e.g. date: "2026-03-30"');
  if (typeof date !== "string" || !ISO_DATE.test(date)) invalid(file, "frontmatter date must be YYYY-MM-DD");
  if (typeof description !== "string") invalid(file, "frontmatter needs a description");
  if (typeof draft !== "boolean") invalid(file, "frontmatter draft must be true or false");
  return { title, date, description, draft };
}

function readPost(dir: string, slug: string): Post {
  const file = path.join(dir, `${slug}.mdx`);
  if (!SLUG.test(slug)) invalid(file, "file name must be lowercase words joined by hyphens, e.g. my-post.mdx");
  const { data, content } = matter(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf-8"));
  const meta = { slug, ...parseFrontmatter(data, file), readingTime: readingTime(content).text };
  return { meta, content };
}

export function getAllPosts(options: Options = {}): PostMeta[] {
  const { dir, includeDrafts } = resolve(options);
  return fs
    .readdirSync(/*turbopackIgnore: true*/ dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readPost(dir, f.slice(0, -".mdx".length)).meta)
    .filter((meta) => includeDrafts || !meta.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string, options: Options = {}): Post | null {
  const { dir, includeDrafts } = resolve(options);
  if (!SLUG.test(slug) || !fs.existsSync(/*turbopackIgnore: true*/ path.join(dir, `${slug}.mdx`))) return null;
  const post = readPost(dir, slug);
  return includeDrafts || !post.meta.draft ? post : null;
}
