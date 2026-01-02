export const sessionRunKeys = {
  all: () => ["session-runs"] as const,
  detail: (runId: string) =>
    [...sessionRunKeys.all(), "detail", runId] as const,
  checkins: (runId: string) =>
    [...sessionRunKeys.all(), "checkins", runId] as const,
  activities: (runId: string) =>
    [...sessionRunKeys.all(), "activities", runId] as const,
  list: (input?: { status?: string; page?: number; limit?: number }) =>
    [
      ...sessionRunKeys.all(),
      "list",
      input?.status ?? "ALL",
      input?.page ?? 1,
      input?.limit ?? 20,
    ] as const,
} as const;
