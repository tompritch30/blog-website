import Container from "@/components/Container";

// A missing page in the same frame as the others: the title and a pointer to the nav, which already
// links every page and carries the alien, so this page links nothing twice.
export default function NotFound() {
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">Page not found</h1>
        <p className="lead">Nothing lives at this address. The pages at the top lead back in.</p>
      </div>
    </Container>
  );
}
