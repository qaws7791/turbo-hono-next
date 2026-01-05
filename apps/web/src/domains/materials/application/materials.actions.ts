import {
  completeMaterialUpload,
  deleteMaterial,
  initMaterialUpload,
  listSpaceMaterials,
} from "../api/materials.api";

import type { Material } from "../model/materials.types";

import { nowIso } from "~/foundation/lib/time";

export async function listMaterialsForUi(
  spaceId: string,
): Promise<Array<Material>> {
  const { data } = await listSpaceMaterials(spaceId, { page: 1, limit: 100 });
  return data;
}

export async function getMaterialCountForSpaceUi(
  spaceId: string,
): Promise<number> {
  const { meta } = await listSpaceMaterials(spaceId, { page: 1, limit: 1 });
  return meta.total;
}

export async function deleteMaterialForUi(materialId: string): Promise<void> {
  await deleteMaterial(materialId);
}

export async function uploadFileMaterialForUi(input: {
  spaceId: string;
  file: File;
  title: string;
}): Promise<void> {
  const init = await initMaterialUpload(input.spaceId, {
    originalFilename: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    fileSize: input.file.size,
  });

  await completeMaterialUpload(input.spaceId, {
    uploadId: init.uploadId,
    title: input.title,
    etag: nowIso(),
  });
}
