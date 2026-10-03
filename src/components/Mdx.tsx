import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export default function Mdx({ source }: { source: string }) {
  return (
    <div className="prose prose-zinc max-w-none">
      <MDXRemote
        source={source}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight, rehypeSlug] } }}
      />
    </div>
  );
}
