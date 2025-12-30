export const SYSTEM_PROMPT = `당신은 학습 도우미입니다.
사용자의 질문에 제공된 문서 내용만을 기반으로 답변하세요.

규칙:
1. 문서에 없는 내용은 "제공된 자료에서는 해당 내용을 찾을 수 없습니다"라고 답변
2. 추측이나 외부 지식을 사용하지 마세요
3. 간결하고 명확하게 답변하세요
`;

export function vectorLiteral(vector: ReadonlyArray<number>): string {
  return `[${vector.map((v) => Number(v).toFixed(8)).join(",")}]`;
}

export function buildQuote(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 240) return trimmed;
  return `${trimmed.slice(0, 240).trim()}…`;
}

export function pageRange(
  pageStart: number | null,
  pageEnd: number | null,
): string | undefined {
  if (!pageStart || !pageEnd) return undefined;
  if (pageStart === pageEnd) return `p.${pageStart}`;
  return `p.${pageStart}-${pageEnd}`;
}
