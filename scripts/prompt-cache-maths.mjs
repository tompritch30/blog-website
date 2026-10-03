// Every number in src/content/posts/what-prompt-caching-actually-saves.mdx comes from here.
// Run: node scripts/prompt-cache-maths.mjs
// Prices are US dollars per million tokens. Inputs are synthetic or public list prices
// (see the post for sources and the access date).

const PER_M = 1_000_000;
const usd = (x) => `$${x.toFixed(x < 1 ? 4 : 2)}`;
const pct = (x) => `${(x * 100).toFixed(1)}%`;

// Expected price multiplier on the cached prefix, per request, at hit rate h.
const prefixMultiplier = (h, write, read) => h * read + (1 - h) * write;
// Hit rate at which caching costs the same as not caching: h*read + (1-h)*write = 1.
const breakEvenHitRate = (write, read) => (write - 1) / (write - read);

console.log("## Break-even hit rate");
for (const [label, write, read] of [
  ["5-minute write 1.25x, read 0.1x", 1.25, 0.1],
  ["1-hour write 2x, read 0.1x", 2, 0.1],
  ["5-minute write 1.25x, read 0.05x", 1.25, 0.05],
  ["1-hour write 2x, read 0.05x", 2, 0.05],
]) {
  console.log(`${label}: ${pct(breakEvenHitRate(write, read))}`);
}

console.log("\n## Example A: steady support assistant");
const a = {
  inputPrice: 2, outputPrice: 10, write: 1.25, read: 0.1,
  prefix: 6_000, suffix: 500, output: 300, requestsPerDay: 10_000, missesPerDay: 40,
};
const hA = 1 - a.missesPerDay / a.requestsPerDay;
const uncachedA = a.requestsPerDay * ((a.prefix + a.suffix) * a.inputPrice + a.output * a.outputPrice) / PER_M;
const cachedA = a.requestsPerDay * (
  a.prefix * a.inputPrice * prefixMultiplier(hA, a.write, a.read) + a.suffix * a.inputPrice + a.output * a.outputPrice
) / PER_M;
const prefixShareA = a.prefix * a.inputPrice / ((a.prefix + a.suffix) * a.inputPrice + a.output * a.outputPrice);
console.log(`hit rate ${pct(hA)}; prefix multiplier ${prefixMultiplier(hA, a.write, a.read).toFixed(4)}`);
console.log(`per request uncached ${usd(uncachedA / a.requestsPerDay)}, cached ${usd(cachedA / a.requestsPerDay)}`);
console.log(`per day uncached ${usd(uncachedA)}, cached ${usd(cachedA)}, saving ${pct(1 - cachedA / uncachedA)}`);
console.log(`prefix share of the uncached bill ${pct(prefixShareA)}; ceiling on saving ${pct(prefixShareA * (1 - a.read))}`);
const outputShareA = a.output * a.outputPrice / ((a.prefix + a.suffix) * a.inputPrice + a.output * a.outputPrice);
console.log(`output share of the uncached bill ${pct(outputShareA)}`);

console.log("\n## Example B: a user who replies every 8 minutes, 10 turns, 20k-token shared prefix");
const b = { inputPrice: 2, prefix: 20_000, turns: 10 };
const unit = b.prefix * b.inputPrice / PER_M;
const none = b.turns * unit;
const fiveMin = b.turns * 1.25 * unit; // every turn arrives after the entry expired: always a write
const oneHour = (2 + (b.turns - 1) * 0.1) * unit; // one write, then reads
console.log(`no caching ${usd(none)}; 5-minute TTL ${usd(fiveMin)} (${pct(fiveMin / none - 1)} vs none); 1-hour TTL ${usd(oneHour)} (${pct(1 - oneHour / none)} saved)`);

console.log("\n## Saving on the whole bill by prefix share (hit rate 95%, write 1.25x, read 0.1x)");
for (const share of [0.2, 0.5, 0.8, 0.95]) {
  console.log(`prefix ${pct(share)} of the bill -> bill falls ${pct(share * (1 - prefixMultiplier(0.95, 1.25, 0.1)))}`);
}
