import { completeMaterialUpload } from "../internal/application/complete-material-upload";
import { completeMaterialUploadWithProgress } from "../internal/application/complete-material-upload-stream";
import { deleteMaterial } from "../internal/application/delete-material";
import { enqueueMaterialProcessing } from "../internal/application/enqueue-material-processing";
import { getJobStatus } from "../internal/application/get-job-status";
import { getMaterialDetail } from "../internal/application/get-material-detail";
import { initiateMaterialUpload } from "../internal/application/initiate-material-upload";
import { listMaterials } from "../internal/application/list-materials";
import { createMaterialProcessor } from "../internal/application/process-material";
import { updateMaterialTitle } from "../internal/application/update-material-title";
import { createMaterialRepository } from "../internal/infrastructure/material.repository";

import type {
  ProgressCallback,
  UploadProgressStep,
} from "../internal/application/complete-material-upload-stream";
import type { Database } from "@repo/database";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";
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
} from "./schema";
import type {
  MaterialProcessingProcessor,
  MaterialProcessingQueuePort,
} from "./queue.types";
import type {
  DocumentParserPort,
  MaterialAnalyzerPort,
  R2StoragePort,
  RagIngestorPort,
  RagRetrieverForMaterialPort,
  RagVectorStoreManagerForMaterialPort,
} from "./ports";
import type { MaterialRepository } from "../internal/infrastructure/material.repository";

export * from "./schema";
export * from "./ports";
export * from "./queue.types";

export { createMaterialRepository };
export type { MaterialRepository };

export type MaterialServiceDeps = {
  readonly materialRepository: MaterialRepository;
  readonly documentParser: DocumentParserPort;
  readonly materialAnalyzer: MaterialAnalyzerPort;
  readonly ragIngestor: RagIngestorPort;
  readonly ragRetriever: RagRetrieverForMaterialPort;
  readonly ragVectorStoreManager: RagVectorStoreManagerForMaterialPort;
  readonly r2: R2StoragePort;
  readonly materialProcessingQueue: MaterialProcessingQueuePort;
};

export type MaterialService = {
  readonly completeMaterialUpload: (
    userId: string,
    input: CompleteMaterialUploadInput,
  ) => ResultAsync<CreateMaterialResult, AppError>;
  readonly completeMaterialUploadWithProgress: (
    userId: string,
    input: CompleteMaterialUploadInput,
    onProgress?: ProgressCallback,
  ) => ReturnType<ReturnType<typeof completeMaterialUploadWithProgress>>;
  readonly enqueueMaterialProcessing: (
    userId: string,
    input: CompleteMaterialUploadInput,
  ) => ResultAsync<CreateMaterialResult, AppError>;
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
    enqueueMaterialProcessing: enqueueMaterialProcessing({
      materialRepository: deps.materialRepository,
      r2: deps.r2,
      materialProcessingQueue: deps.materialProcessingQueue,
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

export type CreateMaterialRepositoryDeps = {
  readonly db: Database;
};

export function createMaterialRepositoryFromDeps(
  deps: CreateMaterialRepositoryDeps,
): MaterialRepository {
  return createMaterialRepository(deps.db);
}

export { createMaterialProcessor };
export type { UploadProgressStep, ProgressCallback };
export type MaterialProcessor = ReturnType<typeof createMaterialProcessor>;
export type MaterialProcessingWorkerProcessor = MaterialProcessingProcessor;
