import "./globals.css";
import { StructuredData } from "./features/seo/components/StructuredData";
import {
  buildSiteMetadata,
  getSiteOrigin,
} from "./features/seo/services/siteMetadata";

export const viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export async function generateMetadata() {
  const siteOrigin = await getSiteOrigin();
  return buildSiteMetadata(siteOrigin);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  return (
    <html lang="en">
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
