import type { ComponentProps } from "react";

// Code blocks scroll sideways inside the article on a phone rather than widening the page; tabindex
// lets a keyboard user reach and scroll them (axe: scrollable-region-focusable). CONTROLS.json counts
// them as "scroll regions" on post pages.
export default function Pre(props: ComponentProps<"pre">) {
  return <pre {...props} tabIndex={0} />;
}
