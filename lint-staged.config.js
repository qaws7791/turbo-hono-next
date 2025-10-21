/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */

export default {
  "*.{js,jsx,mjs,ts,tsx,mts,mdx}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css,html,yml,yaml}": ["prettier --write"],
};
