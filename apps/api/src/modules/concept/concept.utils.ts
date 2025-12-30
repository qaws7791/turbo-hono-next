import type { ConceptReviewRating, ConceptReviewStatus } from "./concept.dto";

export type SrsState = {
  readonly interval: number;
  readonly ease: number;
};

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

export function getTodayStart(): Date {
  return parseDateOnly(new Date().toISOString().slice(0, 10));
}

export function computeReviewStatus(dueAt: Date | null): ConceptReviewStatus {
  if (!dueAt) return "GOOD";

  const today = getTodayStart();
  const dueWindowEnd = addDays(today, 3);

  if (dueAt.getTime() < today.getTime()) return "OVERDUE";
  if (dueAt.getTime() <= dueWindowEnd.getTime()) return "DUE";
  return "GOOD";
}

export function calculateNextSrs(
  prev: SrsState,
  rating: ConceptReviewRating,
): SrsState {
  const interval = Math.max(1, prev.interval);
  const ease = prev.ease;

  switch (rating) {
    case "AGAIN":
      return { interval: 1, ease: Math.max(1.3, ease - 0.2) };
    case "HARD":
      return { interval: Math.round(interval * 1.2), ease: ease - 0.15 };
    case "GOOD":
      return { interval: Math.round(interval * ease), ease };
    case "EASY":
      return { interval: Math.round(interval * ease * 1.3), ease: ease + 0.15 };
  }
}

export function extractSrsState(
  value: Record<string, unknown> | null,
): SrsState | null {
  if (!value) return null;
  const interval = value.interval;
  const ease = value.ease;
  if (typeof interval !== "number" || typeof ease !== "number") return null;
  return { interval, ease };
}
