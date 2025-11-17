//  @ts-check

import { URL, fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import { reactConfig } from "@repo/config/eslint/react";
import storybookPlugin from "eslint-plugin-storybook";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));
export default [
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  ...reactConfig,
  ...storybookPlugin.configs["flat/recommended"],
];
