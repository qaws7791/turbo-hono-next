export const progressKeys = {
  root: ["progress"] as const,
  daily: (start: string, end: string) =>
    [...progressKeys.root, "daily", start, end] as const,
};
