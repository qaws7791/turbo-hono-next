module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-case": [0],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "remove",
        "revert",
        "style",
        "test",
      ],
    ],
  },
};
