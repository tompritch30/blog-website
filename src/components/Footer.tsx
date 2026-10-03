import Container from "@/components/Container";
import AlienTrigger from "@/components/invaders/AlienTrigger";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-divider py-10">
      <Container className="flex items-center justify-between text-xs text-secondary">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span className="flex items-center gap-3">
          <a href="/feed.xml" className="hover:text-fg">
            RSS feed
          </a>
          {/* temporary home for the easter egg trigger; the lead places it in the final design */}
          <AlienTrigger konami />
        </span>
      </Container>
    </footer>
  );
}
