import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

const excludedProps = new Set([
  "id",
  "slot",
  "onCopy",
  "onCut",
  "onPaste",
  "onCompositionStart",
  "onCompositionEnd",
  "onCompositionUpdate",
  "onSelect",
  "onBeforeInput",
  "onInput",
]);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-links",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      compilerOptions: {
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        baseUrl: process.cwd(),
        paths: {
          "@repo/ui": ["../../packages/ui/src"],
          "@repo/ui/*": ["../../packages/ui/src/*"],
        },
      },
      propFilter: (prop) =>
        !prop.name.startsWith("aria-") && !excludedProps.has(prop.name),
    },
  },
  async viteFinal(config) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const uiSrc = path.resolve(currentDir, "../../../packages/ui/src");
    const resolve = config.resolve ?? {};
    if (Array.isArray(resolve.alias)) {
      resolve.alias = [...resolve.alias, { find: "@", replacement: uiSrc }];
    } else {
      resolve.alias = { ...(resolve.alias ?? {}), "@": uiSrc };
    }
    config.resolve = resolve;
    return config;
  },
};
export default config;
