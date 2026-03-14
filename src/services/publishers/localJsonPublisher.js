import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const draftsDir = path.resolve(__dirname, "../../../drafts");

export async function publishToLocalJson(page) {
  await fs.mkdir(draftsDir, { recursive: true });

  const jsonPath = path.join(draftsDir, `${page.slug}.json`);
  const htmlPath = path.join(draftsDir, `${page.slug}.html`);

  await fs.writeFile(jsonPath, JSON.stringify(page.pageModel, null, 2), "utf8");
  await fs.writeFile(htmlPath, page.previewHtml, "utf8");

  return {
    provider: "local-json",
    status: "saved",
    draftId: page.slug,
    files: {
      jsonPath,
      htmlPath
    }
  };
}
