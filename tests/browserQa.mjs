import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { unzipSync } from "fflate";
import { PDFDocument } from "pdf-lib";
import { chromium } from "playwright-core";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const baseUrl = process.env.SECUREPDF_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
let contactPayload = null;
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

function requireCheck(condition, message) {
  if (!condition) throw new Error(message);
}

async function computed(selector, property) {
  return page.locator(selector).first().evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

async function clickSecondaryAction(name) {
  const desktopButton = page.locator(".desktop-actions").getByRole("button", { name });
  if (await desktopButton.isVisible()) {
    await desktopButton.click();
    return;
  }
  await page.locator(".mobile-actions").evaluate((element) => {
    element.open = true;
  });
  await page.locator(".mobile-actions").getByRole("button", { name }).click();
  await page.locator(".mobile-actions").evaluate((element) => {
    element.open = false;
  });
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
requireCheck((await page.locator(".brand-mark").count()) === 0, "Brand mark remains");
requireCheck(
  (await page.locator(".privacy-strip").innerText()).includes("never uploaded"),
  "Privacy strip is missing",
);
requireCheck(
  (await computed(".quick-grid div", "grid-template-columns")).split(" ").length === 2,
  "Guarantee text is not beside its number",
);
requireCheck(
  (await computed(".seo-content", "background-color")) === "rgb(245, 245, 245)",
  "SEO content does not have a solid grey background",
);
requireCheck(
  (await page.locator(".seo-faq details").count()) > 10,
  "FAQ does not contain enough questions",
);
const faqTitleBounds = await page.locator(".seo-faq h2").boundingBox();
const firstFaqBounds = await page.locator(".seo-faq details").first().boundingBox();
requireCheck(
  firstFaqBounds.y - (faqTitleBounds.y + faqTitleBounds.height) >= 16,
  "FAQ title does not have enough space below it",
);
const closedChevron = await computed(".faq-chevron", "transform");
await page.locator(".seo-faq summary").first().click();
await page.waitForTimeout(200);
const openChevron = await computed(".faq-chevron", "transform");
requireCheck(closedChevron !== openChevron, "FAQ chevron does not rotate");
await page.locator(".seo-faq summary").first().click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${projectRoot}/tmp/home-qa.png`, fullPage: true });

await page.locator('input[type="file"]').setInputFiles([
  `${projectRoot}/tmp/pdfs/three-pages.pdf`,
  `${projectRoot}/tmp/pdfs/two-landscape-pages.pdf`,
]);
await page.locator(".document-card").nth(1).waitFor();
requireCheck((await page.locator(".document-card").count()) === 2, "PDF import failed");

const previewQuality = await page.locator(".page-card img").first().evaluate((image) => ({
  naturalWidth: image.naturalWidth,
  clientWidth: image.clientWidth,
}));
requireCheck(previewQuality.naturalWidth >= 900, "Preview is not high resolution");
const toolbarBefore = await page.locator(".toolbar").boundingBox();
const cardBefore = await page.locator(".page-card").first().boundingBox();
await page.getByLabel("Zoom pages in").click();
const toolbarAfter = await page.locator(".toolbar").boundingBox();
const cardAfter = await page.locator(".page-card").first().boundingBox();
requireCheck(cardAfter.width > cardBefore.width, "Page-only zoom did not resize pages");
requireCheck(toolbarAfter.height === toolbarBefore.height, "Page zoom changed the header");
await page.getByLabel("Zoom pages in").click();
await page.getByLabel("Zoom pages in").click();
const maximumZoomQuality = await page.locator(".page-card img").first().evaluate((image) => ({
  naturalWidth: image.naturalWidth,
  clientWidth: image.clientWidth,
}));
requireCheck(
  maximumZoomQuality.naturalWidth / maximumZoomQuality.clientWidth >= 2.4,
  "Maximum app zoom does not retain enough preview pixels",
);
await page.getByLabel("Zoom pages out").click();
await page.getByLabel("Zoom pages out").click();

await page.getByRole("button", { name: "Verify and download" }).click();
await page.getByLabel("PDF title").fill("Client / Bundle.pdf");
const downloadPromise = page.waitForEvent("download");
await page
  .locator(".export-name-dialog")
  .getByRole("button", { name: "Verify & download" })
  .click();
const verifiedDownload = await downloadPromise;
requireCheck(
  /^Client Bundle-[a-f0-9]{16}\.pdf$/.test(verifiedDownload.suggestedFilename()),
  "Custom PDF title was not used for the verified download",
);

await page.getByRole("button", { name: "Verify and download" }).click();
await page.getByRole("radio", { name: /Separate PDFs/ }).check();
await page.getByLabel("ZIP title").fill("Separate / Rows.zip");
await page.screenshot({ path: `${projectRoot}/tmp/export-dialog-qa.png` });
const archiveDownloadPromise = page.waitForEvent("download");
await page
  .locator(".export-name-dialog")
  .getByRole("button", { name: "Verify & download" })
  .click();
const archiveDownload = await archiveDownloadPromise;
requireCheck(
  archiveDownload.suggestedFilename() === "Separate Rows.zip",
  "Separate row archive did not use the requested name",
);
const archivePath = await archiveDownload.path();
const archiveEntries = unzipSync(await readFile(archivePath));
const separatePageCounts = await Promise.all(
  Object.values(archiveEntries).map(async (bytes) => {
    const document = await PDFDocument.load(bytes);
    return document.getPageCount();
  }),
);
requireCheck(
  separatePageCounts.join(",") === "3,2",
  "Separate row PDFs did not preserve document boundaries",
);

const center = await page.locator(".toolbar-center").boundingBox();
requireCheck(
  Math.abs(center.x + center.width / 2 - 720) < 4,
  "Header summary is not centered",
);
const lightAction = await computed(".primary-action", "background-color");
await clickSecondaryAction("Dark mode");
const darkAction = await computed(".primary-action", "background-color");
requireCheck(lightAction === "rgb(23, 23, 23)", "Light action color is incorrect");
requireCheck(darkAction === "rgb(255, 255, 255)", "Dark action color is incorrect");

const sourceHandle = await page.locator(".page-grip").first().boundingBox();
const targetZone = await page.locator(".page-end-drop").nth(1).boundingBox();
await page.mouse.move(sourceHandle.x + 8, sourceHandle.y + 8);
await page.mouse.down();
await page.mouse.move(targetZone.x + targetZone.width / 2, targetZone.y + 20, {
  steps: 15,
});
await page.mouse.up();
await page.waitForTimeout(250);
const pageCounts = await page.locator(".document-title span").allTextContents();
requireCheck(
  pageCounts[0].includes("2") && pageCounts[1].includes("3"),
  "Cross-document page drag failed",
);
const documentHandle = await page.locator(".drag-handle").first().boundingBox();
const targetDocument = await page.locator(".document-header").nth(1).boundingBox();
await page.mouse.move(documentHandle.x + 10, documentHandle.y + 10);
await page.mouse.down();
await page.mouse.move(
  targetDocument.x + targetDocument.width / 2,
  targetDocument.y + targetDocument.height / 2,
  { steps: 15 },
);
await page.mouse.up();
await page.waitForTimeout(250);
requireCheck(
  (await page.locator(".document-title input").first().inputValue()) ===
    "two-landscape-pages",
  "Whole-document drag failed",
);

await page.setViewportSize({ width: 390, height: 844 });
const brandIsUncovered = await page.locator(".brand").evaluate((element) => {
  const bounds = element.getBoundingClientRect();
  const topElement = document.elementFromPoint(
    bounds.left + bounds.width / 2,
    bounds.top + bounds.height / 2,
  );
  return topElement === element || element.contains(topElement);
});
requireCheck(brandIsUncovered, "Mobile actions overlap the SecurePDF brand");
requireCheck(await page.locator(".add-document-card").isVisible(), "Mobile add card hidden");
requireCheck(
  (await page.evaluate(() => document.documentElement.scrollWidth)) <= 390,
  "Mobile rows overflow the page",
);
await page.locator('input[type="file"]').setInputFiles(
  `${projectRoot}/tmp/pdfs/two-landscape-pages.pdf`,
);
await page.locator(".document-card").nth(2).waitFor();
await page.getByRole("button", { name: "Columns" }).click();
requireCheck(
  await page.locator(".add-document-card.columns").isVisible(),
  "Column sibling add card hidden",
);
requireCheck(
  (await computed(".document-workspace.columns", "scrollbar-width")) === "thin",
  "Columns workspace scrollbar is not thin",
);
await page.getByRole("button", { name: "Verify and download" }).click();
const mobileExportDialog = await page.locator(".export-name-dialog").boundingBox();
requireCheck(
  mobileExportDialog.y >= 0 &&
    mobileExportDialog.y + mobileExportDialog.height <= 844,
  "Export choice dialog does not fit the mobile viewport",
);
await page.screenshot({
  path: `${projectRoot}/tmp/export-dialog-mobile-qa.png`,
});
await page.locator(".export-name-dialog").getByLabel("Close").click();
await page.screenshot({ path: `${projectRoot}/tmp/mobile-qa.png`, fullPage: true });

await page.setViewportSize({ width: 1440, height: 900 });
await page.locator('input[type="file"]').setInputFiles(
  `${projectRoot}/tmp/pdfs/interactive-form.pdf`,
);
await page.getByText("This PDF has live form fields", { exact: false }).waitFor();
requireCheck((await page.locator(".document-card").count()) === 3, "Rejected form changed state");
await page.route("https://api.web3forms.com/submit", async (route) => {
  contactPayload = JSON.parse(route.request().postData() ?? "{}");
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  });
});
await clickSecondaryAction("Contact");
requireCheck(
  (await page.locator(".contact-dialog").innerText()).includes("never includes PDFs"),
  "Contact privacy copy missing",
);
requireCheck(
  (await computed(".dialog-backdrop", "backdrop-filter")).includes("blur"),
  "Contact backdrop is not blurred",
);
const contactName = page.getByLabel("Name", { exact: true });
const restingContactBackground = await computed("#contact-name", "background-color");
await contactName.fill("SecurePDF QA");
await contactName.focus();
requireCheck(
  (await computed("#contact-name", "background-color")) === restingContactBackground,
  "Focused contact field changed background color",
);
await page.getByLabel("Email", { exact: true }).fill("qa@example.com");
await page
  .getByLabel("Message", { exact: true })
  .fill("This is an automated browser check for the contact form.");
await page.getByRole("button", { name: "Send message" }).click();
await page.getByText("Message sent.", { exact: false }).waitFor();
requireCheck(contactPayload?.source === "securepdf-contact", "Contact request was not sent");
requireCheck(
  !JSON.stringify(contactPayload).includes(".pdf"),
  "Contact request included PDF metadata",
);
await page.getByLabel("Close").click();
await clickSecondaryAction("Support");
requireCheck(
  !(await page.locator(".support-dialog").innerText()).includes("difficult PDFs"),
  "Removed support copy remains",
);
requireCheck(
  (await page.getByRole("link", { name: /Support from India/ }).getAttribute("href")) ===
    "https://rzp.io/rzp/Mja4hAh",
  "Domestic Razorpay page is not connected",
);
requireCheck(
  await page.getByRole("button", { name: /Support internationally/ }).isDisabled(),
  "International support should remain unavailable during review",
);
await page.getByLabel("Close").click();
await page.screenshot({ path: `${projectRoot}/tmp/desktop-qa.png`, fullPage: true });

console.log(
  JSON.stringify(
    {
      previewQuality,
      maximumZoomQuality,
      pageCounts,
      separatePageCounts,
      errors,
    },
    null,
    2,
  ),
);
requireCheck(errors.length === 0, `Browser errors: ${errors.join(" | ")}`);
await browser.close();
