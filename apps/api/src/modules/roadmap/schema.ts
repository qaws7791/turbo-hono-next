import { z } from "@hono/zod-openapi";

// Request schemas
export const RoadmapListQuerySchema = z.object({
  cursor: z.string().optional().openapi({
    description: "Cursor for pagination (encoded string)",
    example: "eyJpZCI6MTIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==",
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    description: "Number of items to return",
    example: 20,
  }),
  search: z.string().optional().openapi({
    description: "Search query for title or description",
    example: "JavaScript learning",
  }),
  status: z.enum(["active", "archived"]).optional().openapi({
    description: "Filter by roadmap status",
    example: "active",
  }),
  sort: z.enum(["created_at", "updated_at", "title"]).default("created_at").openapi({
    description: "Sort field",
    example: "created_at",
  }),
  order: z.enum(["asc", "desc"]).default("desc").openapi({
    description: "Sort order",
    example: "desc",
  }),
});

// Response schemas
export const RoadmapItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the roadmap",
    example: "abc123def456",
  }),
  title: z.string().openapi({
    description: "Roadmap title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "Roadmap description",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Current status of the roadmap",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "Target completion weeks",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "Weekly study hours",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "Main learning goal",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

export const RoadmapListResponseSchema = z.object({
  items: z.array(RoadmapItemSchema).openapi({
    description: "List of roadmaps",
  }),
  pagination: z.object({
    hasNext: z.boolean().openapi({
      description: "Whether there are more items",
      example: true,
    }),
    nextCursor: z.string().nullable().openapi({
      description: "Cursor for the next page",
      example: "eyJpZCI6MjAsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDIifQ==",
    }),
    total: z.number().int().openapi({
      description: "Total number of items (if available)",
      example: 150,
    }),
  }).openapi({
    description: "Pagination information",
  }),
});

// Roadmap creation schemas
export const RoadmapCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "Roadmap title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().optional().openapi({
    description: "Roadmap description",
    example: "Complete guide to becoming a full stack developer",
  }),
  learningTopic: z.string().min(1).max(100).openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.enum(["beginner", "basic", "intermediate", "advanced", "expert"]).openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().min(1).max(24).openapi({
    description: "Target completion weeks (1-24)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).openapi({
    description: "Weekly study hours (1-60)",
    example: 10,
  }),
  learningStyle: z.string().min(1).max(100).openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().min(1).max(100).openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().min(1).max(200).openapi({
    description: "Main learning goal",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().optional().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
});

export const RoadmapCreateResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the created roadmap",
    example: "abc123def456",
  }),
  title: z.string().openapi({
    description: "Roadmap title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "Roadmap description",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Current status of the roadmap",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "Target completion weeks",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "Weekly study hours",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "Main learning goal",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
});

// Roadmap update schemas
export const RoadmapUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "Roadmap title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().optional().openapi({
    description: "Roadmap description",
    example: "Complete guide to becoming a full stack developer",
  }),
  learningTopic: z.string().min(1).max(100).optional().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.enum(["beginner", "basic", "intermediate", "advanced", "expert"]).optional().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().min(1).max(24).optional().openapi({
    description: "Target completion weeks (1-24)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).optional().openapi({
    description: "Weekly study hours (1-60)",
    example: 10,
  }),
  learningStyle: z.string().min(1).max(100).optional().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().min(1).max(100).optional().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().min(1).max(200).optional().openapi({
    description: "Main learning goal",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().optional().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
});

export const RoadmapUpdateResponseSchema = RoadmapItemSchema;

// Roadmap status change schemas
export const RoadmapStatusChangeRequestSchema = z.object({
  status: z.enum(["active", "archived"]).openapi({
    description: "New status for the roadmap",
    example: "archived",
  }),
});

export const RoadmapStatusChangeResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the roadmap",
    example: "abc123def456",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Updated status",
    example: "archived",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// Roadmap deletion response
export const RoadmapDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "Deletion confirmation message",
    example: "Roadmap deleted successfully",
  }),
  deletedId: z.string().openapi({
    description: "Public ID of the deleted roadmap",
    example: "abc123def456",
  }),
});

// Common path parameter schema
export const RoadmapParamsSchema = z.object({
  roadmapId: z.string().min(1).openapi({
    description: "Public ID of the roadmap",
    example: "abc123def456",
  }),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      description: "Error code",
      example: "roadmap:invalid_pagination_cursor",
    }),
    message: z.string().openapi({
      description: "Error message",
      example: "Invalid pagination cursor provided",
    }),
  }),
});

// ========== Goal Schemas ==========

// Goal item schema
export const GoalItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the goal",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  title: z.string().openapi({
    description: "Goal title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().nullable().openapi({
    description: "Goal description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  order: z.number().int().openapi({
    description: "Display order of the goal",
    example: 1,
  }),
  isExpanded: z.boolean().openapi({
    description: "Whether the goal is expanded in UI",
    example: true,
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// Goal creation schemas
export const GoalCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "Goal title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().optional().openapi({
    description: "Goal description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  isExpanded: z.boolean().default(true).openapi({
    description: "Whether the goal should be expanded by default",
    example: true,
  }),
});

export const GoalCreateResponseSchema = GoalItemSchema;

// Goal update schemas
export const GoalUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "Goal title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().optional().openapi({
    description: "Goal description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  isExpanded: z.boolean().optional().openapi({
    description: "Whether the goal is expanded in UI",
    example: true,
  }),
});

export const GoalUpdateResponseSchema = GoalItemSchema;

// Goal reorder schema
export const GoalReorderRequestSchema = z.object({
  newOrder: z.number().int().min(1).openapi({
    description: "New order position for the goal (1-based)",
    example: 3,
  }),
});

export const GoalReorderResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the reordered goal",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  order: z.number().int().openapi({
    description: "Updated order position",
    example: 3,
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// Goal deletion response
export const GoalDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "Deletion confirmation message",
    example: "Goal deleted successfully",
  }),
  deletedId: z.string().openapi({
    description: "Public ID of the deleted goal",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

// Path parameter schemas
export const GoalParamsSchema = z.object({
  goalId: z.string().min(1).openapi({
    description: "Public ID of the goal",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

export const RoadmapGoalParamsSchema = z.object({
  roadmapId: z.string().min(1).openapi({
    description: "Public ID of the roadmap",
    example: "abc123def456",
  }),
  goalId: z.string().min(1).openapi({
    description: "Public ID of the goal",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

// ========== SubGoal Schemas ==========

// SubGoal item schema
export const SubGoalItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the sub-goal",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
  title: z.string().openapi({
    description: "Sub-goal title",
    example: "Learn variables and data types",
  }),
  description: z.string().nullable().openapi({
    description: "Sub-goal description",
    example: "Understand different data types: string, number, boolean, array, object",
  }),
  isCompleted: z.boolean().openapi({
    description: "Whether the sub-goal is completed",
    example: false,
  }),
  dueDate: z.string().nullable().openapi({
    description: "Due date for the sub-goal",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().nullable().openapi({
    description: "Personal memo for the sub-goal",
    example: "Focus on practice with real examples",
  }),
  order: z.number().int().openapi({
    description: "Display order of the sub-goal",
    example: 1,
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// SubGoal creation schemas
export const SubGoalCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "Sub-goal title",
    example: "Learn variables and data types",
  }),
  description: z.string().optional().openapi({
    description: "Sub-goal description",
    example: "Understand different data types: string, number, boolean, array, object",
  }),
  dueDate: z.string().datetime().optional().openapi({
    description: "Due date for the sub-goal (ISO 8601 format)",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().optional().openapi({
    description: "Personal memo for the sub-goal",
    example: "Focus on practice with real examples",
  }),
});

export const SubGoalCreateResponseSchema = SubGoalItemSchema;

// SubGoal update schemas
export const SubGoalUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "Sub-goal title",
    example: "Learn variables and data types",
  }),
  description: z.string().optional().openapi({
    description: "Sub-goal description",
    example: "Understand different data types: string, number, boolean, array, object",
  }),
  isCompleted: z.boolean().optional().openapi({
    description: "Whether the sub-goal is completed",
    example: true,
  }),
  dueDate: z.string().datetime().optional().openapi({
    description: "Due date for the sub-goal (ISO 8601 format)",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().optional().openapi({
    description: "Personal memo for the sub-goal",
    example: "Focus on practice with real examples",
  }),
});

export const SubGoalUpdateResponseSchema = SubGoalItemSchema;

// SubGoal move schema
export const SubGoalMoveRequestSchema = z.object({
  newGoalId: z.string().min(1).openapi({
    description: "Public ID of the target goal to move sub-goal to",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  newOrder: z.number().int().min(1).optional().openapi({
    description: "New order position for the sub-goal (1-based). If not provided, will be placed at the end.",
    example: 2,
  }),
});

export const SubGoalMoveResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the moved sub-goal",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
  goalId: z.string().openapi({
    description: "Public ID of the goal the sub-goal was moved to",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  order: z.number().int().openapi({
    description: "Updated order position",
    example: 2,
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// SubGoal deletion response
export const SubGoalDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "Deletion confirmation message",
    example: "Sub-goal deleted successfully",
  }),
  deletedId: z.string().openapi({
    description: "Public ID of the deleted sub-goal",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

// Path parameter schemas
export const SubGoalParamsSchema = z.object({
  subGoalId: z.string().min(1).openapi({
    description: "Public ID of the sub-goal",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

export const RoadmapGoalSubGoalParamsSchema = z.object({
  roadmapId: z.string().min(1).openapi({
    description: "Public ID of the roadmap",
    example: "abc123def456",
  }),
  goalId: z.string().min(1).openapi({
    description: "Public ID of the goal",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  subGoalId: z.string().min(1).openapi({
    description: "Public ID of the sub-goal",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});