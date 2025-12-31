export type Space = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SpaceListResponse = {
  data: Array<Space>;
};

export type SpaceDetail = Space;

export type SpaceDetailResponse = {
  data: SpaceDetail;
};

export type CreateSpaceBody = {
  name: string;
  description?: string;
};

export type UpdateSpaceBody = {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
};

// UI Types (from features)
export type SpaceCard = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
};
