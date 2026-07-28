import type { ReactNode } from "react";

interface LegalSection {
  readonly heading: string;
  readonly content: ReactNode;
}

interface LegalPageProps {
  readonly title: string;
  readonly summary: string;
  readonly sections: LegalSection[];
}

export function LegalPage({
  title,
  summary,
  sections,
}: LegalPageProps): React.JSX.Element {
  return (
    <main className="legal-page">
      <header>
        <a href="/" className="legal-brand">RealSecurePdf</a>
        <a href="/" className="legal-back">Back to workspace</a>
      </header>
      <article>
        <span className="legal-kicker">Policy</span>
        <h1>{title}</h1>
        <p className="legal-summary">{summary}</p>
        <p className="legal-updated">Last updated: July 28, 2026</p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <div>{section.content}</div>
          </section>
        ))}
      </article>
    </main>
  );
}
