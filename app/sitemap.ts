import { getSiteOrigin } from "./features/seo/services/siteMetadata";

const INDEXABLE_PATHS = ["/", "/privacy", "/terms"] as const;

export default async function sitemap() {
  const siteOrigin = await getSiteOrigin();

  return INDEXABLE_PATHS.map((path) => ({
    url: `${siteOrigin}${path}`,
  }));
}
