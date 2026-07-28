import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function request(path = "/", accept = "text/html") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://realsecurepdf.example${path}`, {
      headers: {
        accept,
        host: "realsecurepdf.example",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function plainWordCount(html) {
  return html
    .replaceAll(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function faqAnswerWordCount(html) {
  const answerMatches = html.matchAll(
    /<details><summary>.*?<\/summary><p>(.*?)<\/p><\/details>/gs,
  );
  return [...answerMatches].reduce(
    (total, match) => total + plainWordCount(match[1]),
    0,
  );
}

test("server-renders the RealSecurePdf application shell", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(
    response.headers.get("content-security-policy") ?? "",
    /default-src 'self'/i,
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  const html = await response.text();
  assert.match(
    html,
    /<title>Free Private PDF Merger &amp; Page Organizer \| RealSecurePdf<\/title>/i,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/realsecurepdf\.example\/"/i,
  );
  assert.match(html, /<meta name="robots" content="index, follow"/i);
  assert.match(html, /"@type":"WebApplication"/i);
  assert.match(html, /"@type":"FAQPage"/i);
  assert.match(html, /RealSecurePdf/);
  assert.match(html, /Arrange PDFs safely/);
  assert.match(html, /Merge PDFs without uploading/);
  assert.ok((html.match(/<details>/g) ?? []).length > 10);
  assert.ok(faqAnswerWordCount(html) > 600);
  assert.doesNotMatch(html, /href="\/refunds"|>Refunds</i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("provides crawlable robots and sitemap metadata", async () => {
  const robots = await readFile(
    new URL("../public/robots.txt", import.meta.url),
    "utf8",
  );
  assert.match(robots, /User-Agent: \*/i);
  assert.match(robots, /Allow: \//i);
  assert.match(
    robots,
    /Sitemap: https:\/\/securepdf\.saivarun1410\.workers\.dev\/sitemap\.xml/i,
  );

  const sitemapResponse = await request("/sitemap.xml", "application/xml");
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /<loc>https:\/\/realsecurepdf\.example\/<\/loc>/i);
  assert.match(sitemap, /<loc>https:\/\/realsecurepdf\.example\/privacy<\/loc>/i);
  assert.match(sitemap, /<loc>https:\/\/realsecurepdf\.example\/terms<\/loc>/i);
  assert.doesNotMatch(sitemap, /refunds/i);
});

test("serves an installable web application manifest", async () => {
  const response = await request(
    "/manifest.webmanifest",
    "application/manifest+json",
  );
  assert.equal(response.status, 200);
  const manifest = await response.json();
  assert.equal(manifest.name, "RealSecurePdf — Private PDF Merger");
  assert.equal(manifest.start_url, "/");
});
