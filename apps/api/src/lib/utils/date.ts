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

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatIsoDatetime(date: Date): string {
  return date.toISOString();
}

export function isoDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function isoDateRequired(value: Date): string {
  return value.toISOString();
}

export function isoDateTime(value: Date): string {
  return value.toISOString();
}
