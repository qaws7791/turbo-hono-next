const PUBLIC_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const PUBLIC_ID_LENGTH = 12;

const PUBLIC_ID_MASK = 2 ** Math.ceil(Math.log2(PUBLIC_ID_ALPHABET.length)) - 1;
const PUBLIC_ID_STEP = Math.ceil(
  (1.6 * PUBLIC_ID_MASK * PUBLIC_ID_LENGTH) / PUBLIC_ID_ALPHABET.length,
);

export function generatePublicId(): string {
  if (typeof crypto === "undefined" || !("getRandomValues" in crypto)) {
    throw new Error(
      "crypto.getRandomValues is required to generate public ids",
    );
  }

  const chars: Array<string> = [];
  const bytes = new Uint8Array(PUBLIC_ID_STEP);

  while (chars.length < PUBLIC_ID_LENGTH) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      const index = byte & PUBLIC_ID_MASK;
      if (index >= PUBLIC_ID_ALPHABET.length) continue;
      const char = PUBLIC_ID_ALPHABET[index];
      if (!char) continue;
      chars.push(char);
      if (chars.length >= PUBLIC_ID_LENGTH) return chars.join("");
    }
  }

  return chars.join("");
}

export function isPublicId(value: string): boolean {
  return /^[0-9a-z]{12}$/.test(value);
}
