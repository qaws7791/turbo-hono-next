import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "src/**/*.tsx", "src/styles.css"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: ["react", "react-dom"],
  treeshake: true,
  minify: false,
  target: "es2022",
  tsconfig: "tsconfig.json",
});
