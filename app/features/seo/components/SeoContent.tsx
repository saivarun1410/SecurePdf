import { REAL_SECURE_PDF_FAQ_ENTRIES } from "../services/faqContent";

const PRODUCT_FEATURES = [
  {
    heading: "Merge PDFs without uploading",
    body: "PDF bytes, filenames, thumbnails, and the merged file remain in this browser tab. RealSecurePdf has no document-upload endpoint or document storage.",
  },
  {
    heading: "Reorder every PDF page",
    body: "Drag pages within a document or move them between PDFs. Keep the default horizontal row layout or switch to a column-based workspace.",
  },
  {
    heading: "Verify before downloading",
    body: "RealSecurePdf reopens the generated file and checks its structure, page count, dimensions, and renderability before enabling the download.",
  },
] as const;

export function SeoContent(): React.JSX.Element {
  return (
    <section className="seo-content" aria-labelledby="secure-pdf-merger">
      <div className="seo-content-inner">
        <div className="seo-intro">
          <span>Free browser PDF merger</span>
          <h2 id="secure-pdf-merger">
            Merge and reorder PDF pages without sending files to a server
          </h2>
          <p>
            RealSecurePdf is a private online PDF organizer for combining documents,
            moving pages, and checking the finished file before download.
          </p>
        </div>

        <div className="seo-feature-grid">
          {PRODUCT_FEATURES.map((feature) => (
            <article key={feature.heading}>
              <h3>{feature.heading}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="seo-steps">
          <h2>How to merge PDF files securely</h2>
          <ol>
            <li><strong>Choose PDFs.</strong> Files open only in this tab.</li>
            <li><strong>Arrange pages.</strong> Drag pages in rows or columns.</li>
            <li><strong>Verify and download.</strong> Failed checks cannot download.</li>
          </ol>
        </div>

        <div className="seo-faq">
          <h2>Frequently asked questions</h2>
          {REAL_SECURE_PDF_FAQ_ENTRIES.map((item) => (
            <details key={item.question}>
              <summary>
                <span>{item.question}</span>
                <i className="faq-chevron" aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
