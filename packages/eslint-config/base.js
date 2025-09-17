import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    ignores: ["**/dist/", "**/build/", "**/out/", "**/coverage/"],
  },
];

export default config;
