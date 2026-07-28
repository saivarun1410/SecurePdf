import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OUTPUT_DIRECTORY = new URL("../tmp/pdfs/", import.meta.url);

async function createTextPdf(fileName, pageCount, landscape = false) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pageCount; index += 1) {
    const size = landscape ? [792, 612] : [612, 792];
    const page = document.addPage(size);
    page.drawText(`RealSecurePdf clarity fixture - page ${index + 1}`, {
      x: 48,
      y: size[1] - 72,
      size: 18,
      font,
      color: rgb(0.08, 0.08, 0.08),
    });
    for (let line = 0; line < 24; line += 1) {
      const y = size[1] - 110 - line * 22;
      page.drawText(`Fine text line ${line + 1}: sharp rendering at every app zoom.`, {
        x: 48,
        y,
        size: 8,
        font,
        color: rgb(0.25, 0.25, 0.25),
      });
      page.drawLine({
        start: { x: 350, y: y + 3 },
        end: { x: size[0] - 48, y: y + 3 },
        thickness: 0.4,
        color: rgb(0.65, 0.65, 0.65),
      });
    }
  }
  await writeFile(new URL(fileName, OUTPUT_DIRECTORY), await document.save());
}

async function createInteractivePdf() {
  const document = await PDFDocument.create();
  const page = document.addPage([612, 792]);
  const form = document.getForm();
  const field = form.createTextField("full_name");
  field.setText("Editable value");
  field.addToPage(page, { x: 48, y: 680, width: 240, height: 32 });
  await writeFile(
    new URL("interactive-form.pdf", OUTPUT_DIRECTORY),
    await document.save(),
  );
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await createTextPdf("three-pages.pdf", 3);
await createTextPdf("two-landscape-pages.pdf", 2, true);
await createInteractivePdf();
