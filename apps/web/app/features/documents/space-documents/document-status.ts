import type { Document } from "~/mock/schemas";

export function documentStatusLabel(status: Document["status"]): string {
  if (status === "pending") return "대기";
  if (status === "analyzing") return "분석 중";
  if (status === "completed") return "분석 완료";
  return "오류";
}

export function documentStatusBadgeVariant(
  status: Document["status"],
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "completed") return "secondary";
  if (status === "error") return "destructive";
  return "outline";
}

