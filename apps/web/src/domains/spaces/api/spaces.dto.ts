import type { paths } from "~/foundation/types/api";

export type SpaceDetailOk =
  paths["/api/spaces/{spaceId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiSpace = SpaceDetailOk["data"];

type CreateSpaceRequestBody = NonNullable<
  paths["/api/spaces"]["post"]["requestBody"]
>;

export type CreateSpaceBody =
  CreateSpaceRequestBody["content"]["application/json"];

type UpdateSpaceRequestBody = NonNullable<
  paths["/api/spaces/{spaceId}"]["patch"]["requestBody"]
>;

export type UpdateSpaceBody =
  UpdateSpaceRequestBody["content"]["application/json"];
