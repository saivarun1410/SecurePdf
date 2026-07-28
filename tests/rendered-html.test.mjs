import assert from "node:assert/strict";
import test from "node:test";

async function request(path = "/", accept = "text/html") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://securepdf.example${path}`, {
      headers: {
        accept,
        host: "securepdf.example",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SecurePDF application shell", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(
    html,
    /<title>Free Private PDF Merger &amp; Page Organizer \| SecurePDF<\/title>/i,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/securepdf\.example\/"/i,
  );
  assert.match(html, /<meta name="robots" content="index, follow"/i);
  assert.match(html, /"@type":"WebApplication"/i);
  assert.match(html, /SecurePDF/);
  assert.match(html, /Arrange PDFs safely/);
  assert.match(html, /Merge PDFs without uploading/);
  assert.doesNotMatch(html, /href="\/refunds"|>Refunds</i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("serves crawlable robots and sitemap metadata", async () => {
  const robotsResponse = await request("/robots.txt", "text/plain");
  const robots = await robotsResponse.text();
  assert.equal(robotsResponse.status, 200);
  assert.match(robots, /User-Agent: \*/i);
  assert.match(robots, /Allow: \//i);
  assert.match(
    robots,
    /Sitemap: https:\/\/securepdf\.example\/sitemap\.xml/i,
  );

  const sitemapResponse = await request("/sitemap.xml", "application/xml");
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /<loc>https:\/\/securepdf\.example\/<\/loc>/i);
  assert.match(sitemap, /<loc>https:\/\/securepdf\.example\/privacy<\/loc>/i);
  assert.match(sitemap, /<loc>https:\/\/securepdf\.example\/terms<\/loc>/i);
  assert.doesNotMatch(sitemap, /refunds/i);
});

test("serves an installable web application manifest", async () => {
  const response = await request(
    "/manifest.webmanifest",
    "application/manifest+json",
  );
  assert.equal(response.status, 200);
  const manifest = await response.json();
  assert.equal(manifest.name, "SecurePDF — Private PDF Merger");
  assert.equal(manifest.start_url, "/");
});
