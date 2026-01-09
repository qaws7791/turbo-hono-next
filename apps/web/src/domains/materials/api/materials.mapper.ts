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

export function toMaterialFromApi(item: ApiMaterialListItem): Material {
  return {
    id: item.id,
    title: item.title,
    kind: item.sourceType === "TEXT" ? "text" : "file",
    status: mapProcessingStatus(item.processingStatus),
    summary: item.summary ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
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
