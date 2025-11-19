/**
 * Date formatting utilities
 */

/**
 * Formats a date to a localized date string
 * @param date - Date string (ISO 8601) or Date object
 * @param locale - Locale string (default: "ko-KR")
 * @returns Formatted date string
 * @example
 * formatDate("2024-01-15T10:30:00Z") // "2024. 1. 15."
 * formatDate(new Date(), "en-US") // "1/15/2024"
 */
export const formatDate = (date: string | Date, locale = "ko-KR"): string => {
  return new Date(date).toLocaleDateString(locale);
};
