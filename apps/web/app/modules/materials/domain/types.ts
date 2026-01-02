import type {
  MaterialDetailApiResponse,
  SpaceMaterialsApiResponse,
  UploadCompleteAcceptedApiResponse,
  UploadCompleteApiBody,
  UploadCompleteCreatedApiResponse,
  UploadInitApiBody,
  UploadInitApiResponse,
} from "../api/schema";

export type MaterialListItem = SpaceMaterialsApiResponse["data"][number];

export type MaterialSourceType = MaterialListItem["sourceType"];

export type MaterialProcessingStatus = MaterialListItem["processingStatus"];

export type MaterialsListMeta = SpaceMaterialsApiResponse["meta"];

export type SpaceMaterialsResponse = SpaceMaterialsApiResponse;

export type MaterialDetail = MaterialDetailApiResponse["data"];

export type MaterialDetailResponse = MaterialDetailApiResponse;

export type UploadInitBody = UploadInitApiBody;

export type UploadInitResponse = UploadInitApiResponse;

export type UploadCompleteBody = UploadCompleteApiBody;

export type UploadCompleteCreatedResponse = UploadCompleteCreatedApiResponse;

export type UploadCompleteAcceptedResponse = UploadCompleteAcceptedApiResponse;
