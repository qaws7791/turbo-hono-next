import type { MaterialRepository } from "@repo/core/modules/material";
import type { MaterialReaderPort } from "@repo/core/modules/plan";

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
