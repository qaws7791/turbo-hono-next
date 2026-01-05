import type { MaterialKind, MaterialStatus } from "./materials.types";

export function materialStatusLabel(status: MaterialStatus): string {
  if (status === "pending") return "대기";
  if (status === "analyzing") return "분석 중";
  if (status === "completed") return "분석 완료";
  return "오류";
}

export function materialKindLabel(kind: MaterialKind): string {
  if (kind === "file") return "파일";
  if (kind === "url") return "URL";
  if (kind === "text") return "텍스트";
  return kind;
}
