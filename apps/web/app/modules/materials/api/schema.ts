import type { paths } from "~/modules/api";

export type SpaceMaterialsApiResponse =
  paths["/api/spaces/{spaceId}/materials"]["get"]["responses"][200]["content"]["application/json"];

export type MaterialDetailApiResponse =
  paths["/api/materials/{materialId}"]["get"]["responses"][200]["content"]["application/json"];

export type UploadInitApiBody = NonNullable<
  paths["/api/spaces/{spaceId}/materials/uploads/init"]["post"]["requestBody"]
>["content"]["application/json"];

export type UploadInitApiResponse =
  paths["/api/spaces/{spaceId}/materials/uploads/init"]["post"]["responses"][200]["content"]["application/json"];

export type UploadCompleteApiBody = NonNullable<
  paths["/api/spaces/{spaceId}/materials/uploads/complete"]["post"]["requestBody"]
>["content"]["application/json"];

export type UploadCompleteCreatedApiResponse =
  paths["/api/spaces/{spaceId}/materials/uploads/complete"]["post"]["responses"][201]["content"]["application/json"];

export type UploadCompleteAcceptedApiResponse =
  paths["/api/spaces/{spaceId}/materials/uploads/complete"]["post"]["responses"][202]["content"]["application/json"];
