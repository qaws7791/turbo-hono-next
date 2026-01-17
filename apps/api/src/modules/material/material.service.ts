import { completeMaterialUpload } from "./usecases/complete-material-upload";
import { completeMaterialUploadWithProgress } from "./usecases/complete-material-upload-stream";
import { deleteMaterial } from "./usecases/delete-material";
import { getJobStatus } from "./usecases/get-job-status";
import { getMaterialDetail } from "./usecases/get-material-detail";
import { initiateMaterialUpload } from "./usecases/initiate-material-upload";
import { listMaterials } from "./usecases/list-materials";
import { updateMaterialTitle } from "./usecases/update-material-title";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type {
  CompleteMaterialUploadInput,
  CreateMaterialResult,
  DeleteMaterialResponse,
  GetMaterialDetailResponse,
  InitiateMaterialUploadInput,
  InitiateMaterialUploadResponse,
  JobStatusResponse,
  ListMaterialsInput,
  ListMaterialsResponse,
  UpdateMaterialTitleResponse,
} from "./material.dto";
import type {
  DocumentParserPort,
  MaterialAnalyzerPort,
  R2StoragePort,
  RagIngestorPort,
  RagRetrieverForMaterialPort,
  RagVectorStoreManagerForMaterialPort,
} from "./material.ports";
import type { MaterialRepository } from "./material.repository";

export type MaterialServiceDeps = {
  readonly materialRepository: MaterialRepository;
  readonly documentParser: DocumentParserPort;
  readonly materialAnalyzer: MaterialAnalyzerPort;
  readonly ragIngestor: RagIngestorPort;
  readonly ragRetriever: RagRetrieverForMaterialPort;
  readonly ragVectorStoreManager: RagVectorStoreManagerForMaterialPort;
  readonly r2: R2StoragePort;
};

export type MaterialService = {
  readonly completeMaterialUpload: (
    userId: string,
    input: CompleteMaterialUploadInput,
  ) => ResultAsync<CreateMaterialResult, AppError>;
  readonly completeMaterialUploadWithProgress: (
    userId: string,
    input: CompleteMaterialUploadInput,
    onProgress?: Parameters<
      ReturnType<typeof completeMaterialUploadWithProgress>
    >[2],
  ) => ReturnType<ReturnType<typeof completeMaterialUploadWithProgress>>;
  readonly deleteMaterial: (
    userId: string,
    materialId: string,
  ) => ResultAsync<DeleteMaterialResponse, AppError>;
  readonly getJobStatus: (
    userId: string,
    jobId: string,
  ) => ResultAsync<JobStatusResponse, AppError>;
  readonly getMaterialDetail: (
    userId: string,
    materialId: string,
  ) => ResultAsync<GetMaterialDetailResponse, AppError>;
  readonly initiateMaterialUpload: (
    userId: string,
    input: InitiateMaterialUploadInput,
  ) => ResultAsync<InitiateMaterialUploadResponse, AppError>;
  readonly listMaterials: (
    userId: string,
    input: ListMaterialsInput,
  ) => ResultAsync<ListMaterialsResponse, AppError>;
  readonly updateMaterialTitle: (
    userId: string,
    materialId: string,
    title: string,
  ) => ResultAsync<UpdateMaterialTitleResponse, AppError>;
};

export function createMaterialService(
  deps: MaterialServiceDeps,
): MaterialService {
  const baseDeps = { materialRepository: deps.materialRepository } as const;

  return {
    completeMaterialUpload: completeMaterialUpload({
      materialRepository: deps.materialRepository,
      documentParser: deps.documentParser,
      r2: deps.r2,
      ragIngestor: deps.ragIngestor,
      ragVectorStoreManager: deps.ragVectorStoreManager,
      materialAnalyzer: deps.materialAnalyzer,
    }),
    completeMaterialUploadWithProgress: completeMaterialUploadWithProgress({
      materialRepository: deps.materialRepository,
      documentParser: deps.documentParser,
      r2: deps.r2,
      ragIngestor: deps.ragIngestor,
      ragVectorStoreManager: deps.ragVectorStoreManager,
      materialAnalyzer: deps.materialAnalyzer,
    }),
    deleteMaterial: deleteMaterial({
      materialRepository: deps.materialRepository,
      ragVectorStoreManager: deps.ragVectorStoreManager,
      r2: deps.r2,
    }),
    getJobStatus: getJobStatus(baseDeps),
    getMaterialDetail: getMaterialDetail({
      materialRepository: deps.materialRepository,
      ragRetriever: deps.ragRetriever,
    }),
    initiateMaterialUpload: initiateMaterialUpload({
      materialRepository: deps.materialRepository,
      documentParser: deps.documentParser,
      r2: deps.r2,
    }),
    listMaterials: listMaterials(baseDeps),
    updateMaterialTitle: updateMaterialTitle(baseDeps),
  };
}
