import { LegalPage } from "../features/legal/components/LegalPage";

export const metadata = {
  title: "Terms of Use",
  description:
    "SecurePDF terms covering supported PDF files, local browser processing, document ownership, integrity checks, and safe-use boundaries.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Terms of use"
      summary="SecurePDF is a free utility for viewing, arranging, and merging supported PDF files."
      sections={[
        {
          heading: "Safe-use boundaries",
          content: (
            <p>
              Signed files, interactive forms, active content, encrypted or
              malformed files, and files beyond the published workspace limits
              may be rejected. Live forms are rejected because page copying can
              detach field values or behavior. These limits protect document
              integrity.
            </p>
          ),
        },
        {
          heading: "Your documents",
          content: (
            <p>
              You keep ownership of your files and are responsible for having
              permission to use them. Originals are never modified by the app.
            </p>
          ),
        },
        {
          heading: "Verification",
          content: (
            <p>
              SecurePDF validates generated structure, page count, render
              operations, and dimensions before download. Keep original files
              for archival or regulated workflows.
            </p>
          ),
        },
      ]}
    />
  );
}
