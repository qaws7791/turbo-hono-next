// ============================================================
// Domain Layer - Business Types, Rules, and Utils
// ============================================================
export type {
  CreatePlanBody,
  CreatePlanResponse,
  PlanCurrentLevel,
  PlanDetail,
  PlanDetailResponse,
  PlanGoalType,
  PlanListItem,
  PlanStatus,
  PlanStatusBody,
  PlansListMeta,
  SpacePlansResponse,
  UpdatePlanSessionBody,
  UpdatePlanSessionResponse,
} from "./domain";

export {
  MAX_PLAN_MATERIALS,
  addDaysToToday,
  getPlanGoalLabel,
  isIsoDate,
  planGoalOptions,
  planLevelOptions,
} from "./domain";

// ============================================================
// Application Layer - React Hooks and State Management
// ============================================================
export {
  buildCreatePlanBody,
  planKeys,
  useActivatePlanMutation,
  useCreatePlanMutation,
  usePlanQuery,
  useSetPlanStatusMutation,
  useUpdatePlanSessionMutation,
  useSpacePlansQuery,
} from "./application";

export type { PlansBySpaceKeyInput } from "./application";

// ============================================================
// UI Layer - Components and Views
// ============================================================
export {
  PlanDetailView,
  PlanStatusBadge,
  PlanWizardView,
  SpacePlansView,
} from "./ui";
