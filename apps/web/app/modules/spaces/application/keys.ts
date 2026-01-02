export const spaceKeys = {
  all: ["spaces"] as const,
  list: () => [...spaceKeys.all, "list"] as const,
  detail: (spaceId: string) => [...spaceKeys.all, "detail", spaceId] as const,
};
