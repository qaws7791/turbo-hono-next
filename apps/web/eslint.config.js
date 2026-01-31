//  @ts-check

import { reactConfig } from "@repo/config/eslint/react";

export default [
  ...reactConfig,
  {
    ignores: ["src/foundation/types/api.ts"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["~/domains/*/**"],
              message:
                "Import domains via `~/domains/<domain>` only (use the domain public API).",
            },
          ],
        },
      ],
    },
  },
];
