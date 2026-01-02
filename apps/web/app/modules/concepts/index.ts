// ============================================================
// Domain Layer - Business Types, Rules, and Utils
// ============================================================
export type {
  ConceptDetail,
  ConceptDetailResponse,
  ConceptDetailTab,
  ConceptLibraryFilters,
  ConceptLinkType,
  ConceptListItem,
  ConceptReviewRating,
  ConceptReviewStatus,
  ConceptSearchItem,
  ConceptSearchResponse,
  ConceptsListMeta,
  CreateReviewBody,
  CreateReviewResponse,
  SpaceConceptsResponse,
} from "./domain";

export {
  parseConceptDetailTab,
  sortLearningHistoryNewestFirst,
} from "./domain";

// ============================================================
// Application Layer - React Hooks and State Management
// ============================================================
export {
  conceptKeys,
  useConceptQuery,
  useConceptSearchQuery,
  useCreateConceptReviewMutation,
  useSpaceConceptsQuery,
} from "./application";

export type { ConceptsBySpaceKeyInput } from "./application";

// ============================================================
// UI Layer - Components and Views
// ============================================================
export {
  ConceptCard,
  ConceptDetailView,
  ConceptLibraryView,
  ConceptReviewBadge,
  SpaceConceptsView,
} from "./ui";
