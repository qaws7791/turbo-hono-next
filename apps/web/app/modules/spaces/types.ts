import type { paths } from "~/types/api";

export type SpaceListResponse =
  paths["/api/spaces"]["get"]["responses"][200]["content"]["application/json"];

export type Space = SpaceListResponse["data"][number];

export type SpaceDetailResponse =
  paths["/api/spaces/{spaceId}"]["get"]["responses"][200]["content"]["application/json"];

export type SpaceDetail = SpaceDetailResponse["data"];

export type CreateSpaceBody = NonNullable<
  paths["/api/spaces"]["post"]["requestBody"]
>["content"]["application/json"];

export type UpdateSpaceBody = NonNullable<
  paths["/api/spaces/{spaceId}"]["patch"]["requestBody"]
>["content"]["application/json"];

// UI Types (from features)
export type SpaceCard = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
};
