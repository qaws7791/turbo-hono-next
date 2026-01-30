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
              group: ["**/modules/*/*"],
              message: "Import other modules via `src/modules/<module>` only.",
            },
            {
              group: ["@repo/core/src/**"],
              message: "Import `@repo/core` via its public exports only.",
            },
            {
              group: ["@repo/core/**/internal/**"],
              message:
                "Do not import Core module internals. Use `@repo/core/modules/<module>` (api) exports.",
            },
          ],
        },
      ],
    },
  },
];
