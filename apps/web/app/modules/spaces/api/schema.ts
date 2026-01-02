import type { paths } from "~/modules/api";

export type SpacesListApiResponse =
  paths["/api/spaces"]["get"]["responses"][200]["content"]["application/json"];

export type SpaceDetailApiResponse =
  paths["/api/spaces/{spaceId}"]["get"]["responses"][200]["content"]["application/json"];

export type CreateSpaceApiBody = NonNullable<
  paths["/api/spaces"]["post"]["requestBody"]
>["content"]["application/json"];

export type UpdateSpaceApiBody = NonNullable<
  paths["/api/spaces/{spaceId}"]["patch"]["requestBody"]
>["content"]["application/json"];
