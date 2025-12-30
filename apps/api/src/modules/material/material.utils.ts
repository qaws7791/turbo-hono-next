export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function isoDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function isoDateRequired(value: Date): string {
  return value.toISOString();
}
