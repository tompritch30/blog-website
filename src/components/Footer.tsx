import AlienTrigger from "@/components/invaders/AlienTrigger";
import { formatDate } from "@/lib/dates";
import { revisedDate } from "@/lib/revised";

// The reference's footer row (who and a line on the left, links on the right), without the name,
// which the header already carries: the faces the site is set in, the day it was last revised, the
// feed, and on the right the pixel alien that starts the game.
// The revised day is the last commit's, read once per build (src/lib/revised.ts).
const REVISED = revisedDate();

export default function Footer() {
  return (
    <footer className="site-foot">
      <div className="page site-foot-row">
        <p>
          Set in Newsreader and IBM Plex Sans. Revised <time dateTime={REVISED}>{formatDate(REVISED)}</time>.{" "}
          <a href="/feed.xml">RSS feed</a>
        </p>
        <AlienTrigger konami />
      </div>
    </footer>
  );
}
