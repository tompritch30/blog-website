import { redirect } from "next/navigation";

// Posts are listed on the homepage — keep this URL working for any links
export default function BlogPage() {
  redirect("/");
}
