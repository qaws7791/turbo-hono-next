import type { paths } from "~/foundation/types/api";
import type { Document, DocumentStatus } from "./types";

type ApiMaterialListItem =
  paths["/api/spaces/{spaceId}/materials"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

export function mapProcessingStatus(
  status: ApiMaterialListItem["processingStatus"],
): DocumentStatus {
  if (status === "READY") return "completed";
  if (status === "FAILED") return "error";
  if (status === "PROCESSING") return "analyzing";
  return "pending";
}

export function toDocumentFromApi(
  spaceId: string,
  item: ApiMaterialListItem,
): Document {
  return {
    id: item.id,
    spaceId,
    title: item.title,
    kind: item.sourceType === "TEXT" ? "text" : "file",
    status: mapProcessingStatus(item.processingStatus),
    summary: item.summary ?? undefined,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    analysisReadyAt: undefined,
    source:
      item.sourceType === "FILE"
        ? {
            type: "file",
            fileName: item.title,
            fileSizeBytes: item.fileSize ?? undefined,
          }
        : undefined,
  };
}
