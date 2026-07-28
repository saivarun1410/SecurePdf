import { getSiteOrigin } from "./features/seo/services/siteMetadata";

export default async function robots() {
  const siteOrigin = await getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
