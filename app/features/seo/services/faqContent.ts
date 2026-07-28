export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

export const REAL_SECURE_PDF_FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    question: "Are my PDF files uploaded to RealSecurePdf?",
    answer:
      "No. Supported PDF files are read and processed inside your browser tab. RealSecurePdf does not send PDF bytes, filenames, thumbnails, page counts, or merged output to an application server. The contact form is separate and can access only the name, email address, and message that you deliberately type into it. As with any sensitive document workflow, use a trusted device, keep your browser updated, and avoid installing extensions that can read every page you visit.",
  },
  {
    question: "Is RealSecurePdf free, and do I need an account?",
    answer:
      "RealSecurePdf is currently free to use and does not require registration, a login, or a subscription. The complete PDF arranging and merging workflow is available without payment. Optional support links may be added so people can contribute voluntarily, but a contribution does not unlock features, increase limits, or change how documents are processed. Because there is no account, RealSecurePdf also does not create a cloud document history for you.",
  },
  {
    question: "Can I move pages between different PDF files?",
    answer:
      "Yes. Add two or more supported PDFs, then drag an individual page from one document into another document. You can drop it near a specific page to control its position or use the ending drop area to append it. Entire documents can also be reordered. If moving the final page out of a document would leave it empty, that empty document group is removed from the workspace while the page remains in its new destination.",
  },
  {
    question: "What is the difference between row and column view?",
    answer:
      "Row view is the default and presents each PDF as a horizontal sequence of page thumbnails, which works well on wide screens. Column view places each document in a vertical orientation and lets the workspace extend sideways. Changing the view affects only how pages are displayed while you organize them; it does not rotate pages, change their dimensions, or alter the order used for the merged file. Your preferred view is stored locally in the browser.",
  },
  {
    question: "Does merging modify or overwrite my original PDFs?",
    answer:
      "No. RealSecurePdf treats the imported source bytes as read-only and builds a new output file in browser memory. Renaming a document card, deleting a page from the workspace, changing the document order, or clearing the workspace does not edit the original files on your device. The browser downloads a separate merged PDF only after verification succeeds. Keep your original files as the authoritative copies, especially for archival, legal, financial, or regulated workflows.",
  },
  {
    question: "How does RealSecurePdf verify the merged PDF before download?",
    answer:
      "RealSecurePdf first generates a new PDF from the page order visible in the workspace. It then reopens that output independently with PDF-lib and PDF.js. The checks compare the expected page count, inspect every page operator stream, verify page dimensions, and confirm that pages can be rendered. A structural or rendering failure stops the download instead of offering a questionable file. Successful downloads include a short SHA-256 fingerprint in the filename for easier identification.",
  },
  {
    question: "Why are interactive forms and signed PDFs rejected?",
    answer:
      "Interactive form fields, XFA forms, and digital signatures depend on document-level structures that are not safely preserved when individual pages are copied into a new PDF. Values can become detached from their fields, scripted behavior can stop working, and any existing digital signature normally becomes invalid after modification. RealSecurePdf rejects those files rather than silently changing their meaning. If appropriate for your workflow, print or export a static, unsigned copy and import that copy instead.",
  },
  {
    question: "Why might an encrypted or active-content PDF be rejected?",
    answer:
      "Password-protected, encrypted, malformed, or unsupported PDFs may not be readable consistently in a browser-only workflow. RealSecurePdf also rejects files containing JavaScript, launch actions, embedded files, or similar active content because those features increase risk and are unnecessary for page merging. Rejection happens before the file changes the current workspace. If you are authorized to use the document, create a clean static PDF through a trusted desktop application and try that exported copy.",
  },
  {
    question: "What PDF size and page limits apply?",
    answer:
      "A single PDF can be up to 100 MB. The combined in-memory workspace is limited to 150 MB and 100 total pages. These boundaries reduce the chance that a browser tab becomes unresponsive, particularly on phones and lower-memory computers. Actual performance still depends on page complexity, embedded fonts, images, and available device memory. For a larger job, split it into smaller verified merges, download those results, and combine them in a final pass if necessary.",
  },
  {
    question: "Can I use RealSecurePdf on a phone or tablet?",
    answer:
      "Yes. The workspace is responsive, the main actions remain available on narrow screens, and the drag system supports touch input. Row view stacks document groups vertically on mobile so another PDF can be added below the current documents. Column view intentionally scrolls sideways because each column needs usable page width. For long or image-heavy documents, a desktop computer may still feel faster because it usually has more memory and a larger area for precise page arranging.",
  },
  {
    question: "Why does RealSecurePdf have its own page zoom control?",
    answer:
      "The page zoom control enlarges or reduces only PDF thumbnails, from 75% to 200%, while leaving the application header and controls at a stable size. This is different from browser zoom, which scales the whole interface. RealSecurePdf renders a high-resolution, lossless preview so page text remains clearer while inspecting order and orientation. The thumbnail is still a preview rather than a full PDF editor, so use the downloaded file or a dedicated reader for final print-level inspection.",
  },
  {
    question: "What happens when I clear the workspace or close the tab?",
    answer:
      "Choosing Clear revokes generated thumbnail URLs, removes the current documents, and empties the undo and redo history so PDF bytes are released from the active workspace. Closing or refreshing the tab also ends the in-memory session because documents are not saved to a RealSecurePdf account or server. Download any verified result you want to keep before leaving. Theme and layout preferences may remain in local storage, but they do not contain PDF content or filenames.",
  },
  {
    question: "Does RealSecurePdf track document activity or use analytics?",
    answer:
      "RealSecurePdf does not send document contents, filenames, thumbnails, page counts, or workspace actions to analytics. Small anonymous feature counters and a campaign source may be stored only in your browser's local storage to support local product behavior; the application does not transmit those values. This design keeps document processing separate from marketing and contact functions. The privacy page explains the current boundaries and should be reviewed again if the product later introduces optional paid services.",
  },
] as const;
