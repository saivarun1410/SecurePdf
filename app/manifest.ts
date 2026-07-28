import { SITE_DESCRIPTION } from "./features/seo/services/siteMetadata";

export default function manifest() {
  return {
    name: "SecurePDF — Private PDF Merger",
    short_name: "SecurePDF",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f1",
    theme_color: "#161616",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
