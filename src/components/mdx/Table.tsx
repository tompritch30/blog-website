import type { ComponentProps } from "react";

// globals.css makes .prose tables display:block with overflow-x:auto, so a wide one scrolls inside
// the article on a phone; tabindex lets a keyboard user reach and scroll it (axe:
// scrollable-region-focusable). CONTROLS.json counts it as a "scroll region" on post pages.
export default function Table(props: ComponentProps<"table">) {
  return <table {...props} tabIndex={0} />;
}
