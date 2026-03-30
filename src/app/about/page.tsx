import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "A bit about me.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1
        className="text-xl font-semibold tracking-tight mb-10"
        style={{ color: "var(--text)" }}
      >
        About
      </h1>

      {/*
       * TODO: fill this in. Some prompts to get you started:
       * - What do you build?
       * - What's your background / how did you get here?
       * - What tools/stack do you actually use day-to-day?
       * - What are you interested in right now?
       * - How to reach you (email, GitHub, Twitter)
       */}
      <div className="prose prose-zinc max-w-none">
        <p>
          I'm Tom. I build software.
        </p>
        <p>
          I write here about the engineering decisions, tools, and workflows
          that I find interesting — particularly around LLMs, automation, and
          building small products without a team.
        </p>
        <p>
          Find me on{" "}
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
