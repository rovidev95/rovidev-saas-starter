/**
 * Convert an arbitrary org name into a URL-safe, lowercase slug.
 * Collapses whitespace/symbols to single hyphens and trims edges.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Append a short random suffix to de-duplicate slugs. */
export function withSuffix(slug: string, suffix: string): string {
  const base = slug || "org";
  return `${base}-${suffix}`.slice(0, 56);
}
