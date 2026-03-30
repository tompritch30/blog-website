import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDir = path.join(process.cwd(), "src/content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
};

export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description,
        tags: data.tags ?? [],
        readingTime: readingTime(content).text,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string) {
  const raw = fs.readFileSync(
    path.join(postsDir, `${slug}.mdx`),
    "utf-8"
  );
  const { data, content } = matter(raw);
  return {
    meta: {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
      tags: data.tags ?? [],
      readingTime: readingTime(content).text,
    },
    content,
  };
}

// Re-export from utils so server components can import from one place
export { formatDate } from "./utils";
