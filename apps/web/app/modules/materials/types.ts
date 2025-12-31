import type { paths } from "~/types/api";

export type SpaceMaterialsResponse =
  paths["/api/spaces/{spaceId}/materials"]["get"]["responses"][200]["content"]["application/json"];

export type MaterialListItem = SpaceMaterialsResponse["data"][number];
export type MaterialsListMeta = SpaceMaterialsResponse["meta"];

export type MaterialDetailResponse =
  paths["/api/materials/{materialId}"]["get"]["responses"][200]["content"]["application/json"];

export type MaterialDetail = MaterialDetailResponse["data"];

export type UploadInitBody = NonNullable<
  paths["/api/spaces/{spaceId}/materials/uploads/init"]["post"]["requestBody"]
>["content"]["application/json"];

export type UploadInitResponse =
  paths["/api/spaces/{spaceId}/materials/uploads/init"]["post"]["responses"][200]["content"]["application/json"];

export type UploadCompleteBody = NonNullable<
  paths["/api/spaces/{spaceId}/materials/uploads/complete"]["post"]["requestBody"]
>["content"]["application/json"];

export type UploadCompleteAcceptedResponse =
  paths["/api/spaces/{spaceId}/materials/uploads/complete"]["post"]["responses"][202]["content"]["application/json"];

export type UploadCompleteCreatedResponse =
  paths["/api/spaces/{spaceId}/materials/uploads/complete"]["post"]["responses"][201]["content"]["application/json"];

