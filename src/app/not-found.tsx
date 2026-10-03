import Link from "next/link";
import Container from "@/components/Container";
import { WRITING_PATH } from "@/lib/paths";

export default function NotFound() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-fg">Page not found</h1>
      <p className="text-fg">
        Nothing lives at this address. Try the <Link href="/">home page</Link> or the{" "}
        <Link href={WRITING_PATH}>list of posts</Link>.
      </p>
    </Container>
  );
}
