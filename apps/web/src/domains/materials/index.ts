export { SpaceMaterialsView } from "./ui";

export { useMaterialMutations } from "./application/use-material-mutations";
export { useUploadMaterialDialog } from "./application/use-upload-material-dialog";
export type { UploadMaterialDialog } from "./application/use-upload-material-dialog";

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
