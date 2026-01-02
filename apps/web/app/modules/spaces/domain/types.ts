import type {
  CreateSpaceApiBody,
  SpaceDetailApiResponse,
  SpacesListApiResponse,
  UpdateSpaceApiBody,
} from "../api/schema";

export type Space = SpacesListApiResponse["data"][number];

export type SpaceListResponse = SpacesListApiResponse;

export type SpaceDetail = SpaceDetailApiResponse["data"];

export type SpaceDetailResponse = SpaceDetailApiResponse;

export type CreateSpaceBody = CreateSpaceApiBody;

export type UpdateSpaceBody = UpdateSpaceApiBody;
