import { writeFileSync } from "fs";
import { resolve } from "path";

import { generateOpenApiDocument } from "../openapi";

const document = generateOpenApiDocument();
const outputPath = resolve(process.cwd(), "src/generated/openapi.json");

writeFileSync(outputPath, JSON.stringify(document, null, 2));
console.log(`OpenAPI document generated at ${outputPath}`);
