import { headers } from "next/headers";
import { REAL_SECURE_PDF_FAQ_ENTRIES } from "./faqContent";

export const SITE_NAME = "RealSecurePdf";
export const SITE_DESCRIPTION =
  "Merge and reorder PDF pages free in your browser. Arrange pages in rows or columns, verify the result, and download without uploading your files.";

const LOCAL_SITE_ORIGIN = "http://localhost:3000";
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);
const APPLICATION_FEATURES = [
  "Merge multiple PDF files",
  "Reorder pages with drag and drop",
  "Arrange documents in rows or columns",
  "Verify merged output before download",
  "Process PDF files without uploading them",
] as const;

const BASE_METADATA = {
  title: {
    default: "RealSecurePdf — Free Private PDF Merger & Page Organizer",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "utilities",
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
} as const;

function normalizeOrigin(value: string | undefined): string | null {
  if (!value || !URL.canParse(value)) return null;

  const url = new URL(value);
  return SUPPORTED_PROTOCOLS.has(url.protocol) ? url.origin : null;
}

function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim() || undefined;
}

export async function getSiteOrigin(): Promise<string> {
  const configuredOrigin = normalizeOrigin(
    process.env.NEXT_PUBLIC_SITE_URL?.trim(),
  );
  if (configuredOrigin) return configuredOrigin;

  const requestHeaders = await headers();
  const host = firstHeaderValue(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
  const forwardedProtocol = firstHeaderValue(
    requestHeaders.get("x-forwarded-proto"),
  );
  const protocol = forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");

  return normalizeOrigin(host ? `${protocol}://${host}` : undefined) ??
    LOCAL_SITE_ORIGIN;
}

export function buildSiteMetadata(siteOrigin: string): object {
  const googleVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

  return {
    ...BASE_METADATA,
    metadataBase: new URL(siteOrigin),
    alternates: { canonical: "/" },
    ...(googleVerification
      ? { verification: { google: googleVerification } }
      : {}),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url: "/",
      title: "RealSecurePdf — Free Private PDF Merger",
      description: SITE_DESCRIPTION,
      images: [{
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RealSecurePdf private browser PDF merger",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "RealSecurePdf — Free Private PDF Merger",
      description: SITE_DESCRIPTION,
      images: [{ url: "/og.png", alt: "RealSecurePdf private PDF merger" }],
    },
  };
}

function buildFaqSchema(): object {
  return {
    "@type": "FAQPage",
    mainEntity: REAL_SECURE_PDF_FAQ_ENTRIES.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export function buildApplicationSchema(siteOrigin: string): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        name: SITE_NAME,
        url: siteOrigin,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${siteOrigin}/#application`,
        name: SITE_NAME,
        alternateName: "Real Secure PDF",
        url: siteOrigin,
        description: SITE_DESCRIPTION,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern JavaScript-enabled browser",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: APPLICATION_FEATURES,
        privacyPolicy: `${siteOrigin}/privacy`,
        inLanguage: "en",
      },
      buildFaqSchema(),
    ],
  };
}
