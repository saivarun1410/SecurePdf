import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SecurePDF application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
    assert.match(
      html,
      /<title>SecurePDF — arrange and merge PDFs privately · SecurePDF<\/title>/i,
    );
  assert.match(html, /SecurePDF/);
  assert.match(html, /Arrange PDFs safely/);
  assert.match(html, /Files never upload/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
