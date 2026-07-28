const PRODUCT_FEATURES = [
  {
    heading: "Merge PDFs without uploading",
    body: "PDF bytes, filenames, thumbnails, and the merged file remain in this browser tab. SecurePDF has no document-upload endpoint or document storage.",
  },
  {
    heading: "Reorder every PDF page",
    body: "Drag pages within a document or move them between PDFs. Keep the default horizontal row layout or switch to a column-based workspace.",
  },
  {
    heading: "Verify before downloading",
    body: "SecurePDF reopens the generated file and checks its structure, page count, dimensions, and renderability before enabling the download.",
  },
] as const;

const COMMON_QUESTIONS = [
  {
    question: "Are my PDF files uploaded?",
    answer:
      "No. Supported PDFs are opened and processed locally in your browser memory. They are not sent to SecurePDF servers, analytics, or contact messages.",
  },
  {
    question: "Can I move pages between different PDFs?",
    answer:
      "Yes. Add multiple PDFs, then drag a page onto another document or its ending drop area. You can also reorder complete documents.",
  },
  {
    question: "Does merging change my original files?",
    answer:
      "No. SecurePDF creates a separate merged file in memory. Your original PDFs remain untouched on your device.",
  },
  {
    question: "Why are some interactive PDFs rejected?",
    answer:
      "Live forms, XFA documents, and signed PDFs can lose behavior or signature validity when pages are copied. SecurePDF rejects them to protect document integrity.",
  },
] as const;

export function SeoContent(): React.JSX.Element {
  return (
    <section className="seo-content" aria-labelledby="secure-pdf-merger">
      <div className="seo-intro">
        <span>Free browser PDF merger</span>
        <h2 id="secure-pdf-merger">
          Merge and reorder PDF pages without sending files to a server
        </h2>
        <p>
          SecurePDF is a private online PDF organizer for combining documents,
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
        <h2>SecurePDF questions</h2>
        {COMMON_QUESTIONS.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
