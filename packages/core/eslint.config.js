import { config as baseConfig } from "@repo/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@repo/core/src/**"],
              message: "Import `@repo/core` via its public exports only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/**/internal/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "../*/internal/**",
                "../../*/internal/**",
                "../../../*/internal/**",
                "../../../../*/internal/**",
              ],
              message:
                "Do not import other module internals. Use `../api` contracts (facade/DTO/events) instead.",
            },
          ],
        },
      ],
    },
  },
];
