/**
 * Error handling utilities
 */

/**
 * Extracts a readable error message from an unknown error value
 * @param error - The error value (can be Error, string, or unknown)
 * @param fallback - Default message to use if error message cannot be extracted
 * @returns Extracted or fallback error message
 * @example
 * try {
 *   // ... operation
 * } catch (err) {
 *   const message = getErrorMessage(err, "작업에 실패했습니다");
 *   setError(message);
 * }
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
};
