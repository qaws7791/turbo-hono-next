export { SpaceMaterialsView } from "./ui";

export {
  deleteMaterialForUi,
  getMaterialCountForSpaceUi,
  listMaterialsForUi,
  uploadFileMaterialForUi,
} from "./application/materials.actions";
export { useMaterialMutations } from "./application/use-material-mutations";
export { useSpaceMaterialsModel } from "./application/use-space-materials-model";
export type { SpaceMaterialsModel } from "./application/use-space-materials-model";

export { materialsQueries } from "./materials.queries";

export {
  materialKindLabel,
  materialStatusLabel,
} from "./model/materials.selectors";
export type {
  Material,
  MaterialKind,
  MaterialSource,
  MaterialStatus,
} from "./model/materials.types";
