import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = "packages/clients/dart";
const supportedExtensions = new Set([".dart", ".md"]);

async function normalizeDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".dart_tool" || entry.name === "build") {
      continue;
    }

    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await normalizeDirectory(path);
      continue;
    }

    if (!supportedExtensions.has(extname(entry.name))) {
      continue;
    }

    const source = await readFile(path, "utf8");
    const normalized = `${source
      .split(/\r?\n/u)
      .map((line) => line.trimEnd())
      .join("\n")
      .trimEnd()}\n`;

    if (source !== normalized) {
      await writeFile(path, normalized, "utf8");
    }
  }
}

await normalizeDirectory(root);
