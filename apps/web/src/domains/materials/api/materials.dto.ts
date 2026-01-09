import type { paths } from "~/foundation/types/api";

export type MaterialsListQuery =
  paths["/api/materials"]["get"]["parameters"]["query"];

export type MaterialsListOk =
  paths["/api/materials"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiMaterialListItem = MaterialsListOk["data"][number];

export type MaterialDeleteOk =
  paths["/api/materials/{materialId}"]["delete"]["responses"]["200"]["content"]["application/json"];

type UploadInitRequestBody = NonNullable<
  paths["/api/materials/uploads/init"]["post"]["requestBody"]
>;

export type MaterialUploadInitBody =
  UploadInitRequestBody["content"]["application/json"];

export type MaterialUploadInitOk =
  paths["/api/materials/uploads/init"]["post"]["responses"]["200"]["content"]["application/json"];

type UploadCompleteRequestBody = NonNullable<
  paths["/api/materials/uploads/complete"]["post"]["requestBody"]
>;

export type MaterialUploadCompleteBody =
  UploadCompleteRequestBody["content"]["application/json"];

export type MaterialUploadCompleteAccepted =
  paths["/api/materials/uploads/complete"]["post"]["responses"]["202"]["content"]["application/json"];

export type MaterialUploadCompleteCreated =
  paths["/api/materials/uploads/complete"]["post"]["responses"]["201"]["content"]["application/json"];

export type JobStatusOk =
  paths["/api/jobs/{jobId}"]["get"]["responses"]["200"]["content"]["application/json"];
