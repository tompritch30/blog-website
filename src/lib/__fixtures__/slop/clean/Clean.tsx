import Link from "next/link";

// Comments may say anything — they are not prose on the page!
export default function Clean() {
  const ready = 1 !== 2;
  return (
    <section>
      <h2>Recent writing</h2>
      <p className="text-secondary">Two posts so far, both from 2026.</p>
      <p>
        I build LLM systems for clients. Read the <Link href="/writing">writing</Link> or the CV.
      </p>
      <div className="rounded-sm border p-2 transition-colors motion-reduce:transition-none">{ready ? "Small" : "corners"}</div>
      <h3>Working with Claude Code</h3>
      <p>Released on 3 October 2026.</p>
    </section>
  );
}
