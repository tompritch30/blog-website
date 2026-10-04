import Container from "@/components/Container";
import AlienTrigger from "@/components/invaders/AlienTrigger";

// A missing page in the same frame as the others: the title, a pointer to the nav (which already links
// every page, so the text does not link them twice), and the alien for a visitor with a minute to spare.
export default function NotFound() {
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">Page not found</h1>
        <p className="lead">Nothing lives at this address. The pages at the top lead back in.</p>
        <div className="lost">
          <p>Or shoot down a few invaders while you are here:</p>
          <AlienTrigger />
        </div>
      </div>
    </Container>
  );
}
