import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import ExternalLink from "@/components/ExternalLink";

// Off-site links in posts and the About text open in a new tab and say so, like everywhere else.
function MdxLink({ href = "", children, ...rest }: React.ComponentProps<"a">) {
  if (/^https?:/.test(href)) return <ExternalLink href={href}>{children}</ExternalLink>;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export default function Mdx({ source }: { source: string }) {
  return (
    <div className="prose prose-zinc max-w-none">
      <MDXRemote
        source={source}
        components={{ a: MdxLink }}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight, rehypeSlug] } }}
      />
    </div>
  );
}
