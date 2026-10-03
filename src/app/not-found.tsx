import Link from "next/link";
import Container from "@/components/Container";
import AlienTrigger from "@/components/invaders/AlienTrigger";
import { WRITING_PATH } from "@/lib/paths";

// A missing page in the same frame as the others: the title, two ways on, and the alien for a
// visitor with a minute to spare.
export default function NotFound() {
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">Page not found</h1>
        <p className="lead">
          Nothing lives at this address. Try the <Link href="/">home page</Link> or the <Link href={WRITING_PATH}>list of posts</Link>.
        </p>
        <div className="lost">
          <p>Or shoot down a few invaders while you are here:</p>
          <AlienTrigger />
        </div>
      </div>
    </Container>
  );
}
