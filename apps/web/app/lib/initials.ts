export function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const two = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return two.toUpperCase();
}

