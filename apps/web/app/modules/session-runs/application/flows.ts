export function buildSessionSearchParams(input: {
  runId: string;
  redirectTo?: string | null;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set("runId", input.runId);
  if (input.redirectTo && input.redirectTo.length > 0) {
    params.set("redirectTo", input.redirectTo);
  }
  return params;
}

export function buildSessionUrl(input: {
  runId: string;
  redirectTo?: string | null;
}): string {
  const params = buildSessionSearchParams(input);
  return `/session?${params.toString()}`;
}
