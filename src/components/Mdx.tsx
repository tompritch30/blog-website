import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import ExternalLink from "@/components/ExternalLink";
import Chart from "@/components/mdx/Chart";
import Figure from "@/components/mdx/Figure";
import Pre from "@/components/mdx/Pre";
import Quote from "@/components/mdx/Quote";
import Table from "@/components/mdx/Table";

// Off-site links in posts and the About text open in a new tab and say so, like everywhere else.
function MdxLink({ href = "", children, ...rest }: React.ComponentProps<"a">) {
  if (/^https?:/.test(href)) return <ExternalLink href={href}>{children}</ExternalLink>;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

// What a post can use besides Markdown: <Figure>, <Chart>, <Quote>; code blocks and tables render
// through Pre and Table as keyboard-scrollable regions.
const components = { a: MdxLink, Chart, Figure, Quote, pre: Pre, table: Table };

export default function Mdx({ source }: { source: string }) {
  return (
    <div className="prose prose-zinc max-w-none">
      <MDXRemote
        source={source}
        components={components}
        // Posts are files in this repo, written by the site's owner, so the components may take arrays
        // and objects as props (a chart's data). blockDangerousJS stays on: no eval, Function, process
        // or require inside a post.
        options={{ blockJS: false, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight, rehypeSlug] } }}
      />
    </div>
  );
}
