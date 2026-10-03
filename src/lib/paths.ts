// The Post URL. Its own module so client components can import it without the server-side site config.
export const WRITING_PATH = "/writing";

export function postPath(slug: string): string {
  return `${WRITING_PATH}/${slug}`;
}
