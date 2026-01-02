// ============================================================
// Domain Layer - Business Types, Rules, and Utils
// ============================================================
export type {
  MaterialDetail,
  MaterialDetailResponse,
  MaterialListItem,
  MaterialProcessingStatus,
  MaterialSourceType,
  MaterialsListMeta,
  SpaceMaterialsResponse,
  UploadCompleteAcceptedResponse,
  UploadCompleteBody,
  UploadCompleteCreatedResponse,
  UploadInitBody,
  UploadInitResponse,
} from "./domain";

export { isMaterialReadyForPlan, materialListItemFromDetail } from "./domain";

// ============================================================
// Application Layer - React Hooks and State Management
// ============================================================
export {
  materialKeys,
  uploadMaterial,
  useDeleteMaterialMutation,
  useSpaceMaterialsQuery,
  useUploadMaterialMutation,
} from "./application";

export type { MaterialListBySpaceKeyInput } from "./application";
