import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 16);

/**
 * Generates a random public ID for roadmap entities
 * Uses nanoid
 * @param length - The length of the ID (default: 16)
 * @returns A random hex string of specified length
 */
export function generatePublicId(length: number = 16): string {
  // Generate half the length in bytes since each byte becomes 2 hex characters
  const bytes = nanoid(length);
  return bytes;
}
