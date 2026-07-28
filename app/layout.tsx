import "./globals.css";

export const metadata = {
  title: {
    default: "SecurePDF",
    template: "%s · SecurePDF",
  },
  description:
    "A private, browser-only workspace for arranging and securely merging PDFs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "SecurePDF — arrange PDFs safely",
    description: "Files never upload. Merge only after every page is verified.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
