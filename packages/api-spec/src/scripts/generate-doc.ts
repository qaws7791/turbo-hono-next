import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateOpenApiDocument } from "../openapi";

const main = async () => {
  const doc = generateOpenApiDocument();
  const outDir = path.resolve(process.cwd(), "dist");
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "openapi.json"),
    JSON.stringify(doc, null, 2),
    "utf-8",
  );
};

await main();
