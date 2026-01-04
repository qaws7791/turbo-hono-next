import { invariant } from "./invariant";

const PUBLIC_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const PUBLIC_ID_LENGTH = 12;

const PUBLIC_ID_MASK = 2 ** Math.ceil(Math.log2(PUBLIC_ID_ALPHABET.length)) - 1;
const PUBLIC_ID_STEP = Math.ceil(
  (1.6 * PUBLIC_ID_MASK * PUBLIC_ID_LENGTH) / PUBLIC_ID_ALPHABET.length,
);

export function randomPublicId(): string {
  invariant(
    typeof crypto !== "undefined" && "getRandomValues" in crypto,
    "crypto.getRandomValues is required to generate public ids",
  );

  let id = "";
  const bytes = new Uint8Array(PUBLIC_ID_STEP);

  while (id.length < PUBLIC_ID_LENGTH) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      const index = byte & PUBLIC_ID_MASK;
      if (index >= PUBLIC_ID_ALPHABET.length) continue;
      id += PUBLIC_ID_ALPHABET[index];
      if (id.length >= PUBLIC_ID_LENGTH) return id;
    }
  }

  return id;
}
