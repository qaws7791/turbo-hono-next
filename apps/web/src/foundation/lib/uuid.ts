import { invariant } from "./invariant";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomUuidV4(): string {
  invariant(
    typeof crypto !== "undefined" && "getRandomValues" in crypto,
    "crypto.getRandomValues is required to generate UUIDs",
  );

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Per RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
