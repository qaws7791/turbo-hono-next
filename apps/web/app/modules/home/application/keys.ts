export const homeKeys = {
  all: ["home"] as const,
  queue: () => [...homeKeys.all, "queue"] as const,
};
