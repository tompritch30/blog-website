import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

// An image or any content (a chart, a table) with a caption and an optional source line.
// Images go through next/image: a static import sizes itself; a path under public/ needs width and height.

type Common = { caption: ReactNode; credit?: string; creditHref?: string };
type WithImage = Common & { src: string | StaticImageData; alt: string; width?: number; height?: number; children?: never };
type WithChildren = Common & { src?: undefined; children: ReactNode };

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
            <span>Source: {creditHref ? <a href={creditHref}>{credit}</a> : credit}</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
