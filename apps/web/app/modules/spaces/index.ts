// ============================================================
// Domain Layer - Business Types
// ============================================================
export type {
  CreateSpaceBody,
  Space,
  SpaceDetail,
  SpaceDetailResponse,
  SpaceListResponse,
  UpdateSpaceBody,
} from "./domain";

// ============================================================
// Application Layer - React Hooks and State Management
// ============================================================
export {
  spaceKeys,
  useCreateSpaceMutation,
  useDeleteSpaceMutation,
  useSpaceAppearance,
  useSpaceQuery,
  useSpacesQuery,
  useUpdateSpaceMutation,
} from "./application";

// ============================================================
// UI Layer - Components and Views
// ============================================================
export {
  IconColorPicker,
  SPACE_COLORS,
  SPACE_ICONS,
  SpaceLayoutView,
  SpacesView,
  getColorByName,
  getIconByName,
} from "./ui";
