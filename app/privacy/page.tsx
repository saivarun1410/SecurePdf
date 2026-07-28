import { LegalPage } from "../features/legal/components/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How RealSecurePdf processes PDF files locally in browser memory and protects document contents, filenames, and workspace activity.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Privacy policy"
      summary="RealSecurePdf is designed so the documents you arrange stay on your device."
      sections={[
        {
          heading: "PDF processing",
          content: (
            <p>
              PDF bytes, filenames, thumbnails, and merged output are processed
              in your browser memory. RealSecurePdf does not upload or store them.
            </p>
          ),
        },
        {
          heading: "Local preferences",
          content: (
            <p>
              Theme, layout preference, anonymous feature counters, and a
              campaign source may be stored in your browser&apos;s local storage.
              They are not transmitted by this application.
            </p>
          ),
        },
        {
          heading: "Optional support",
          content: (
            <p>
              If you choose to support the project, an external payment
              provider processes the transaction under its own privacy policy.
              RealSecurePdf never places payment code inside the PDF workspace.
            </p>
          ),
        },
        {
          heading: "Contact messages",
          content: (
            <p>
              The contact form sends only the name, email address, and message
              you deliberately enter to Web3Forms. PDF contents, filenames,
              page counts, and workspace activity are never included.
            </p>
          ),
        },
      ]}
    />
  );
}
