"use client";

// Replaces Next's built-in global error page (Roboto on pure white), which the slop lint rejects.
// It renders its own document instead of the root layout, so it carries its own small stylesheet.
const css = `
body { margin: 0; padding: 3rem 1rem; font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6;
  background: #f3f4f0; color: #1a1e1c; }
main { max-width: 42rem; margin: 0 auto; }
a { color: inherit; }
@media (prefers-color-scheme: dark) { body { background: #131614; color: #e3e6e1; } }
`;

export default function GlobalError() {
  return (
    <html lang="en-GB">
      <body>
        <title>Something went wrong</title>
        <style>{css}</style>
        <main>
          <h1>Something went wrong</h1>
          <p>
            This page failed to load. Try again in a moment, or go to the{" "}
            {/* A full page load on purpose: the client router may be what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">home page</a>.
          </p>
        </main>
      </body>
    </html>
  );
}
