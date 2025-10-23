export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-case": [0],
    "subject-case": [0], // 제목 케이스 제한 해제 (대문자 시작 허용)
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "design", // design 타입 추가
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
