import {
  buildApplicationSchema,
  getSiteOrigin,
} from "../services/siteMetadata";

function serializeStructuredData(value: object): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export async function StructuredData(): Promise<React.JSX.Element> {
  const siteOrigin = await getSiteOrigin();
  const schema = buildApplicationSchema(siteOrigin);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(schema) }}
    />
  );
}
