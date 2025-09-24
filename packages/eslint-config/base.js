import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",

      // Enhanced JavaScript rules from TanStack
      "no-constant-binary-expression": "error",
      "no-loss-of-precision": "error",
      "no-unused-private-class-members": "error",
      "no-useless-backreference": "error",
      "no-var": "error",
      "prefer-const": "error",
      "sort-imports": ["error", { ignoreDeclarationSort: true }],

      // Enhanced TypeScript rules from TanStack
      "@typescript-eslint/array-type": ["error", { default: "generic" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description" }
      ],
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "typeParameter", format: ["PascalCase"], prefix: ["T"] }
      ],

      // Import management rules from TanStack
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
          "newlines-between": "always"
        }
      ]
    },
  },
  {
    ignores: ["**/dist/", "**/build/", "**/out/", "**/coverage/"],
  },
];

export default config;
