import type { MaterialListItem } from "~/modules/materials";

export function documentStatusLabel(
  status: MaterialListItem["processingStatus"],
): string {
  if (status === "PENDING") return "대기";
  if (status === "PROCESSING") return "분석 중";
  if (status === "READY") return "분석 완료";
  return "오류";
}

export function documentStatusBadgeVariant(
  status: MaterialListItem["processingStatus"],
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "READY") return "secondary";
  if (status === "FAILED") return "destructive";
  return "outline";
}

export function documentKindLabel(
  kind: MaterialListItem["sourceType"],
): string {
  if (kind === "FILE") return "파일";
  if (kind === "TEXT") return "텍스트";
  return kind satisfies never;
}
