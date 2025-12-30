import { createHash, randomBytes } from "node:crypto";

const ALLOWED_REDIRECT_PATHS = [
  "/home",
  "/spaces",
  "/session",
  "/today",
  "/concepts",
];

export function validateRedirectPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return ALLOWED_REDIRECT_PATHS.some((allowed) => path.startsWith(allowed));
}

export function computeSessionExpiresAt(now: Date, durationDays: number): Date {
  const expiresAt = new Date(now.getTime());
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  return expiresAt;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
