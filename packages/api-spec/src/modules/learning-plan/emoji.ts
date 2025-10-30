const DEFAULT_LEARNING_PLAN_EMOJI = "📚";

const SINGLE_EMOJI_REGEX =
  /^\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*$/u;
const FLAG_SEQUENCE_REGEX = /^\p{Regional_Indicator}{2}$/u;
const KEYCAP_REGEX = /^[\d#*]\uFE0F?\u20E3$/u;

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("en", { granularity: "grapheme" })
    : null;

export function isSingleEmoji(value: string): boolean {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.includes(" ")) {
    return false;
  }

  if (segmenter) {
    const segments = Array.from(segmenter.segment(trimmed));
    if (segments.length !== 1) {
      return false;
    }
  }

  return (
    SINGLE_EMOJI_REGEX.test(trimmed) ||
    FLAG_SEQUENCE_REGEX.test(trimmed) ||
    KEYCAP_REGEX.test(trimmed)
  );
}

export function normalizeEmoji(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return isSingleEmoji(trimmed) ? trimmed : null;
}

const FALLBACK_EMOJIS = Object.freeze([
  "📚",
  "🧠",
  "🎯",
  "🚀",
  "🛠️",
  "🌱",
  "💡",
  "🧭",
]);

export function pickFallbackEmoji(seed?: string): string {
  if (!seed) {
    return DEFAULT_LEARNING_PLAN_EMOJI;
  }

  const normalizedSeed = seed.trim().toLowerCase();
  if (!normalizedSeed) {
    return DEFAULT_LEARNING_PLAN_EMOJI;
  }

  const hash = Array.from(normalizedSeed).reduce((total, char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    return (total + codePoint) % Number.MAX_SAFE_INTEGER;
  }, 0);

  return (
    FALLBACK_EMOJIS[hash % FALLBACK_EMOJIS.length] ??
    DEFAULT_LEARNING_PLAN_EMOJI
  );
}

export function ensureEmoji(
  value: string | null | undefined,
  seed?: string,
): string {
  return normalizeEmoji(value) ?? pickFallbackEmoji(seed);
}

export const LearningPlanEmoji = {
  DEFAULT: DEFAULT_LEARNING_PLAN_EMOJI,
  isValid: isSingleEmoji,
  normalize: normalizeEmoji,
  ensure: ensureEmoji,
  pickFallback: pickFallbackEmoji,
} as const;
