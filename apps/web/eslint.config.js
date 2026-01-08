//  @ts-check

import { reactConfig } from "@repo/config/eslint/react";

export default [
  ...reactConfig,
  {
    ignores: ["app/types/api.ts", "src/foundation/types/api.ts"],
  },
  {
    files: ["app/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "~/types/api",
              message: "Import `~/types/api` only from `app/modules/api/**`.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/modules/api/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];
