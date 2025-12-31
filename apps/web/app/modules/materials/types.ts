export type MaterialSourceType = "FILE" | "TEXT";

export type MaterialProcessingStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export type MaterialListItem = {
  id: string;
  title: string;
  sourceType: MaterialSourceType;
  mimeType: string | null;
  fileSize: number | null;
  processingStatus: MaterialProcessingStatus;
  summary: string | null;
  tags: Array<string>;
  createdAt: string;
};

export type MaterialsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SpaceMaterialsResponse = {
  data: Array<MaterialListItem>;
  meta: MaterialsListMeta;
};

export type MaterialDetail = {
  id: string;
  spaceId: string;
  title: string;
  sourceType: MaterialSourceType;
  originalFilename: string | null;
  mimeType: string | null;
  fileSize: number | null;
  processingStatus: MaterialProcessingStatus;
  processedAt: string | null;
  summary: string | null;
  tags: Array<string>;
  chunkCount: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MaterialDetailResponse = {
  data: MaterialDetail;
};

export type UploadInitBody = {
  originalFilename: string;
  mimeType: string;
  fileSize: number;
};

export type UploadInitResponse = {
  data: {
    uploadId: string;
    objectKey: string;
    uploadUrl: string;
    method: "PUT";
    headers: Record<string, string>;
    expiresAt: string;
  };
};

export type UploadCompleteBody = {
  uploadId: string;
  title?: string;
  etag?: string;
};

export type UploadCompleteCreatedResponse = {
  data: {
    id: string;
    title: string;
    processingStatus: MaterialProcessingStatus;
    summary?: string | null;
  };
};

export type UploadCompleteAcceptedResponse = {
  data: {
    id: string;
    jobId: string;
    processingStatus: MaterialProcessingStatus;
  };
};
