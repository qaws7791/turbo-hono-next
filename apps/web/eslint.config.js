//  @ts-check

import { reactConfig } from "@repo/config/eslint/react";

export default [
  ...reactConfig,
  {
    ignores: ["app/types/api.ts"],
  },
];
