import { RealSecurePdfApp } from "./features/workspace/components/RealSecurePdfApp";

export const metadata = {
  title: "Free Private PDF Merger & Page Organizer",
  description:
    "Merge PDFs free without uploading files. Drag pages between documents, arrange them in rows or columns, verify the result, and download privately.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <RealSecurePdfApp />;
}
