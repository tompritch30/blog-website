# Release decisions

Status: accepted, 3 Oct 2026. Thomas asked the agents to settle these themselves ("own it").

1. **Public history uses the GitHub noreply identity.** Every commit on the published branch has author and committer `tompritch30 <tompritch30@users.noreply.github.com>`, and the repo's local git config uses it for new commits. The public repo's `main` is this branch; the original local `main` (two commits under a personal address) is never pushed.
2. **Facts about Thomas come only from him.** The tagline and About page say: founding Forward Deployed Engineer at Palindrome (a UK AI company in law and finance), building LLM systems for its clients; MSc Computer Science (Distinction), Imperial College London; IEEE RA-L paper "ForestVO: Enhancing Visual Odometry in Forest Environments Through ForestGlue" (2025). Nothing else is added without his word.
3. **Other people's projects stay out.** A side project in the original scaffold belongs to a friend; it is not named or described anywhere, including history (the published branch was rewritten to remove it).
4. **The existing post keeps only claims that hold.** "How I actually use Claude Code day-to-day" no longer claims a production SaaS or a specific migration tool; its opinions and workflow stay as written.
5. **Writing is all rights reserved; code is MIT.** See `LICENSE`.
6. **Draft figures are checked against the vendors' own pages** (Anthropic, OpenAI, Google), with the access date in the post. Anything that cannot be confirmed is cut. The prompt caching post stays a draft until Thomas publishes it.
7. **The old GitHub Pages site needs nothing.** Thomas renamed it `old-test-site`, so it no longer serves `tompritch30.github.io`.
8. **Preview port 3005.** `npm run dev` serves http://localhost:3005 so it does not clash with other local apps on 3000.
