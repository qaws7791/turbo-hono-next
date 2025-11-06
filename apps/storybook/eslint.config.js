//  @ts-check

import { reactConfig } from "@repo/config/eslint/react";
import storybookPlugin from "eslint-plugin-storybook";

export default [...reactConfig, ...storybookPlugin.configs["flat/recommended"]];
