export { completeMaterialUpload } from "./usecases/complete-material-upload";
export {
  completeMaterialUploadWithProgress,
  type ProgressCallback,
  type UploadProgressStep,
} from "./usecases/complete-material-upload-stream";
export { deleteMaterial } from "./usecases/delete-material";
export { getJobStatus } from "./usecases/get-job-status";
export { getMaterialDetail } from "./usecases/get-material-detail";
export { initiateMaterialUpload } from "./usecases/initiate-material-upload";
export { listMaterials } from "./usecases/list-materials";
export { updateMaterialTitle } from "./usecases/update-material-title";

export { createMaterialService } from "./material.service";
export type { MaterialService } from "./material.service";

export { createMaterialRepository } from "./material.repository";
export type { MaterialRepository } from "./material.repository";

export type {
  CompleteMaterialUploadInput,
  CreateMaterialResult,
  DeleteMaterialResponse,
  GetMaterialDetailResponse,
  InitiateMaterialUploadInput,
  InitiateMaterialUploadResponse,
  JobStatusResponse,
  ListMaterialsInput,
  ListMaterialsResponse,
  MaterialDetail,
  MaterialListItem,
  MaterialProcessingStatus,
  UpdateMaterialTitleResponse,
} from "./material.dto";
