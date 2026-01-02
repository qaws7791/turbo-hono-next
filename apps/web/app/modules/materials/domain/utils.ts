import type { MaterialDetail, MaterialListItem } from "./types";

export function materialListItemFromDetail(
  material: MaterialDetail,
): MaterialListItem {
  return {
    id: material.id,
    title: material.title,
    sourceType: material.sourceType,
    mimeType: material.mimeType,
    fileSize: material.fileSize,
    processingStatus: material.processingStatus,
    summary: material.summary,
    tags: material.tags,
    createdAt: material.createdAt,
  };
}
