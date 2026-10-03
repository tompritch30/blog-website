import Container from "@/components/Container";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-divider py-10">
      <Container className="flex items-center justify-between text-xs text-secondary">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <a href="/feed.xml" className="hover:text-fg">
          RSS feed
        </a>
      </Container>
    </footer>
  );
}
