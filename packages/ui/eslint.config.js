import { reactConfig } from "@repo/config/eslint/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    ignores: ["dist/", "node_modules/", ".turbo/", "**/*.d.ts"],
  },
];
