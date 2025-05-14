import crypto from "node:crypto";

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}
