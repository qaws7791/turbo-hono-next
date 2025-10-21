import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateOpenApiDocument } from "../openapi";

const document = generateOpenApiDocument();

const outputDir = resolve(process.cwd(), "dist");
mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "openapi.json"), JSON.stringify(document, null, 2));
