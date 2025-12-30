export function parseDateOnly(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map((value) => Number(value));
  if (!year || !month || !day) return new Date(isoDate);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isoDateTime(value: Date): string {
  return value.toISOString();
}
