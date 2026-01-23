import type { Material, MaterialStatus } from "../model/materials.types";
import type { ApiMaterialListItem } from "./materials.dto";

function mapProcessingStatus(
  status: ApiMaterialListItem["processingStatus"],
): MaterialStatus {
  if (status === "READY") return "completed";
  if (status === "FAILED") return "error";
  if (status === "PROCESSING") return "analyzing";
  return "pending";
}

function isTextMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  // Simple heuristic: text/* or contains 'markdown', 'json', 'xml'
  // But strict to backend logic if possible.
  // Backend previously used TEXT for markdown/text.
  return (
    mimeType.startsWith("text/") ||
    mimeType.includes("markdown") ||
    mimeType.includes("json") ||
    mimeType.includes("xml")
  );
}

export function toMaterialFromApi(item: ApiMaterialListItem): Material {
  const isText = isTextMimeType(item.mimeType);

  return {
    id: item.id,
    title: item.title,
    kind: isText ? "text" : "file",
    status: mapProcessingStatus(item.processingStatus),
    processingProgress: item.processingProgress ?? null,
    processingStep: item.processingStep ?? null,
    processingError: item.processingError ?? null,
    summary: item.summary ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    source: !isText
      ? {
          type: "file",
          fileName: item.title,
          fileSizeBytes: item.fileSize ?? undefined,
        }
      : undefined,
  };
}
