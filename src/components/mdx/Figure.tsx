import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import ExternalLink from "@/components/ExternalLink";

// An image or any content (a chart, a table) with a caption and an optional source line.
// Images go through next/image: a static import sizes itself; a path under public/ needs width and height.
// An off-site source opens in a new tab and says so, like every other off-site link.

type Common = { caption: ReactNode; credit?: string; creditHref?: string };
type WithImage = Common & { src: string | StaticImageData; alt: string; width?: number; height?: number; children?: never };
type WithChildren = Common & { src?: undefined; children: ReactNode };

function CreditLink({ href, children }: { href: string; children: ReactNode }) {
  return /^https?:/.test(href) ? <ExternalLink href={href}>{children}</ExternalLink> : <a href={href}>{children}</a>;
}

export default function Figure(props: WithImage | WithChildren) {
  const { caption, credit, creditHref } = props;
  return (
    <figure>
      {props.src !== undefined ? (
        <Image src={props.src} alt={props.alt} width={props.width} height={props.height} sizes="(max-width: 672px) 100vw, 672px" className="h-auto w-full" />
      ) : (
        props.children
      )}
      <figcaption>
        {caption}
        {credit && (
          <>
            {" "}
            <span>Source: {creditHref ? <CreditLink href={creditHref}>{credit}</CreditLink> : credit}</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
