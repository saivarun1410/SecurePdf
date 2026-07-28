# SecurePDF

SecurePDF is a browser-only workspace for viewing, rearranging, and merging PDF
pages. Documents are shown in horizontal rows by default and can be switched to
vertical columns.

## Product behavior

- Import multiple PDFs by file picker or drop
- Reorder complete documents and individual pages
- Move pages between documents
- Zoom PDF pages without scaling the application header
- Rename, remove, clear, undo, and redo
- Switch between rows and columns
- Generate a new PDF and download it only after verification
- Offer optional India and international support links
- Send privacy-safe contact messages through optional Web3Forms configuration

## Integrity and security model

PDF bytes stay in browser memory. The application has no upload endpoint and
does not send document bytes, names, thumbnails, or merge output to analytics.
Original byte arrays are treated as immutable and downloads are created as new
files.

Imports fail closed for unsupported extensions, empty or oversized files,
excess workspace capacity, parsing failures, encryption, signatures, active
content, embedded files, and interactive forms. This protects against silently
invalidating a signature or changing form behavior.

Before download, the generated PDF is reopened by `pdf-lib` and independently
by PDF.js. SecurePDF checks page count, every page's operator stream, and page
dimensions. A failed check produces no download. Successful files include a
short SHA-256 fingerprint in the filename.

No general-purpose PDF tool can promise mathematical compatibility with every
possible PDF. SecurePDF's guarantee is operational: keep originals untouched,
reject risky inputs, independently verify output, and fail without downloading.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Release checks:

```bash
npm run typecheck
npm run lint
npm test
npm audit
```

For mouse, touch-sized layout, zoom, theme, and cross-document drag checks,
leave `npm run dev` running and execute `npm run test:browser` in another
terminal. This uses an installed Google Chrome and generated non-user fixtures.

## Optional support payments

Copy `.env.example` to `.env.local` and provide hosted checkout or payment-link
URLs:

```text
NEXT_PUBLIC_SUPPORT_INR_URL=
NEXT_PUBLIC_SUPPORT_USD_URL=
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

The support buttons stay disabled when a URL is absent. Payment processing must
remain external to the PDF workspace so payment providers never receive PDF
data. Review provider onboarding, international-card support, settlement,
taxation, refund, and foreign-exchange requirements for the operating entity
before enabling the links.

The Web3Forms contact payload contains only the name, email address, and
message explicitly entered in the contact dialog. It never reads or sends PDF
bytes, filenames, page counts, or workspace activity. Add the production domain
to the Web3Forms allowed-domain list before enabling the key in hosting.

## Search and Cloudflare deployment

SecurePDF renders indexable product content and includes canonical URLs,
robots directives, a sitemap, social metadata, and WebApplication structured
data. `NEXT_PUBLIC_SITE_URL` can pin these URLs to a future custom domain;
otherwise they follow the request host. Add a Google Search Console HTML-tag
token as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` when one is available.

The production build targets Cloudflare Workers. After authenticating Wrangler,
deploy the generated Worker and static assets with:

```bash
npm run deploy:cloudflare
```
