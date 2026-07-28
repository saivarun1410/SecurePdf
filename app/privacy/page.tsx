import { LegalPage } from "../features/legal/components/LegalPage";

export const metadata = { title: "Privacy" };

export default function PrivacyPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Privacy policy"
      summary="SecurePDF is designed so the documents you arrange stay on your device."
      sections={[
        {
          heading: "PDF processing",
          content: (
            <p>
              PDF bytes, filenames, thumbnails, and merged output are processed
              in your browser memory. SecurePDF does not upload or store them.
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
              SecurePDF never places payment code inside the PDF workspace.
            </p>
          ),
        },
      ]}
    />
  );
}
