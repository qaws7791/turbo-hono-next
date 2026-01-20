import { readFileSync } from "fs";

import { build } from "esbuild";

// package.json에서 dependencies 읽기
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const dependencies = Object.keys(pkg.dependencies || {});
const devDependencies = Object.keys(pkg.devDependencies || {});

// workspace 패키지는 번들에 포함 (external에서 제외)
const workspacePackages = ["@repo/database", "@repo/api-spec", "@repo/config"];

// node_modules 외부 의존성은 external로 처리
const external = [...dependencies, ...devDependencies].filter(
  (dep) => !workspacePackages.includes(dep),
);

// workspace 패키지의 transitive deps는 package.json에 없어서 번들에 포함될 수 있음.
// 특히 @hono/zod-openapi 와 @asteasolutions/zod-to-openapi가 서로 다른 인스턴스로 로드되면
// OpenAPI 메타데이터 인식이 깨져 /openapi.json 생성이 실패할 수 있어 external로 고정한다.
if (!external.includes("@asteasolutions/zod-to-openapi")) {
  external.push("@asteasolutions/zod-to-openapi");
}

const isDev = process.env.NODE_ENV !== "production";

console.log("🔨 Building API with esbuild...");
console.log(`   Mode: ${isDev ? "development" : "production"}`);

const startTime = Date.now();

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.mjs",
  sourcemap: true,
  minify: !isDev,
  treeShaking: true,

  // TypeScript 파일 resolve 지원 (workspace 패키지에서 .ts를 직접 export하므로 필요)
  resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],

  // node_modules 외부 의존성은 external로 처리
  external,

  // ESM에서 __dirname, __filename, require 사용을 위한 배너
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

  // 로그 레벨
  logLevel: "info",
});

const elapsed = Date.now() - startTime;
console.log(`✅ Build completed in ${elapsed}ms`);
