import type { MaterialRepository } from "../material.repository";
import type { MaterialReaderPort } from "../../../../plan/api/ports/material-reader.port";

export function createMaterialReaderPort(
  repo: Pick<
    MaterialRepository,
    "findByIds" | "findMaterialsMetaForPlan" | "findOutlineNodesForPlan"
  >,
): MaterialReaderPort {
  return {
    findByIds: (userId, materialIds) => repo.findByIds(userId, materialIds),
    findMaterialsMetaForPlan: (materialIds) =>
      repo.findMaterialsMetaForPlan(materialIds),
    findOutlineNodesForPlan: (materialIds) =>
      repo.findOutlineNodesForPlan(materialIds),
  };
}
