import fs from "node:fs";
import path from "node:path";
import { organisations, type Organisation } from "@/content/profile";

// Palindrome's own logo, inlined from public/ at build time so it takes the ink colour
// (fill="currentColor"). Its shape is untouched; only the editor's comment,
// the XML prolog and the layer id are dropped.
function logoSvg(src: string): string {
  const file = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", src);
  return fs
    .readFileSync(/*turbopackIgnore: true*/ file, "utf-8")
    .replace(/<\?xml[^>]*\?>/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\sid="[^"]*"/, "")
    .replace("<svg", '<svg aria-hidden="true" focusable="false"')
    .trim();
}

export function organisation(name: string): Organisation {
  const found = organisations.find((o) => o.name === name);
  if (!found) throw new Error(`no organisation named ${name} in src/content/profile.ts`);
  return found;
}

// The others' terms forbid reusing their logos, so they are plain wordmarks in the page's own type.
export default function OrgMark({ name }: { name: string }) {
  const org = organisation(name);
  if (org.logo) {
    return (
      <span className="mark">
        <span
          className="mark-logo"
          role="img"
          aria-label={org.name}
          style={{ aspectRatio: `${org.logo.width} / ${org.logo.height}` }}
          dangerouslySetInnerHTML={{ __html: logoSvg(org.logo.src) }}
        />
      </span>
    );
  }
  return (
    <span className="mark">
      <span aria-hidden="true">{org.short}</span>
      <span className="sr-only">{org.name}</span>
    </span>
  );
}
