import { SecurePdfApp } from "./features/workspace/components/SecurePdfApp";

export const metadata = {
  title: "SecurePDF — arrange and merge PDFs privately",
  description:
    "Arrange PDF pages in rows or columns and create a verified merged PDF. Your files never leave your browser.",
};

export default function Home() {
  return <SecurePdfApp />;
}
