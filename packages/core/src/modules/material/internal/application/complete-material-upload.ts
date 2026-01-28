import { completeMaterialUploadWithProgress } from "./complete-material-upload-stream";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  CompleteMaterialUploadInput,
  CreateMaterialResult,
} from "../../api/schema";
import type {
  DocumentParserPort,
  MaterialAnalyzerPort,
  R2StoragePort,
  RagIngestorPort,
  RagVectorStoreManagerForMaterialPort,
} from "../../api/ports";
import type { MaterialRepository } from "../infrastructure/material.repository";

export function completeMaterialUpload(deps: {
  readonly materialRepository: MaterialRepository;
  readonly documentParser: DocumentParserPort;
  readonly r2: R2StoragePort;
  readonly ragIngestor: RagIngestorPort;
  readonly ragVectorStoreManager: RagVectorStoreManagerForMaterialPort;
  readonly materialAnalyzer: MaterialAnalyzerPort;
}) {
  const withProgress = completeMaterialUploadWithProgress(deps);

  return function completeMaterialUpload(
    userId: string,
    input: CompleteMaterialUploadInput,
  ): ResultAsync<CreateMaterialResult, AppError> {
    return withProgress(userId, input);
  };
}
