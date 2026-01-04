import type { Document } from "~/app/mocks/schemas";

export function materialStatusLabel(status: Document["status"]): string {
  if (status === "pending") return "대기";
  if (status === "analyzing") return "분석 중";
  if (status === "completed") return "분석 완료";
  return "오류";
}

export function materialStatusBadgeVariant(
  status: Document["status"],
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "completed") return "secondary";
  if (status === "error") return "destructive";
  return "outline";
}

export function materialKindLabel(kind: Document["kind"]): string {
  if (kind === "file") return "파일";
  if (kind === "url") return "URL";
  if (kind === "text") return "텍스트";
  return kind;
}
