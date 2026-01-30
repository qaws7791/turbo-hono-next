import { readFileSync } from "fs";

import { build } from "esbuild";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const dependencies = Object.keys(pkg.dependencies || {});
const devDependencies = Object.keys(pkg.devDependencies || {});

const workspacePackages = [
  "@repo/ai",
  "@repo/core",
  "@repo/database",
  "@repo/queue-bullmq",
  "@repo/storage-r2",
  "@repo/config",
];

const external = [...dependencies, ...devDependencies].filter(
  (dep) => !workspacePackages.includes(dep),
);

const isDev = process.env.NODE_ENV !== "production";

console.log("🔨 Building Worker with esbuild...");
console.log(`   Mode: ${isDev ? "development" : "production"}`);

const startTime = Date.now();

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.mjs",
  sourcemap: isDev,
  minify: !isDev,
  treeShaking: true,

  resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  external,

  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`.trim(),
  },

  logLevel: "info",
});

const elapsed = Date.now() - startTime;
console.log(`✅ Build completed in ${elapsed}ms`);
