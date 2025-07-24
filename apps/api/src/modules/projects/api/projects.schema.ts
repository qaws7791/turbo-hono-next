import { z } from "@hono/zod-openapi";

// Request schemas
export const ProjectIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const CreateProjectRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  coverImage: z.string().url(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  categoryId: z.number().int().positive(),
});

export const UpdateProjectRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(["draft", "published"]).optional(),
  categoryId: z.number().int().positive().optional(),
});

export const ProjectQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default("20"),
  sort: z.enum(["latest", "popular"]).optional().default("latest"),
  region: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

export const MyProjectQuerySchema = ProjectQuerySchema.extend({
  status: z.enum(["draft", "published", "all"]).optional().default("all"),
});

// Response schemas
export const ProjectCreatorSchema = z.object({
  id: z.number(),
  username: z.string(),
  displayName: z.string(),
  profileImage: z.string().nullable(),
  creator: z
    .object({
      brandName: z.string(),
      region: z.string(),
      category: z.string(),
      socialLinks: z.record(z.string()).nullable(),
      description: z.string().nullable(),
    })
    .nullable(),
});

export const ProjectStatsSchema = z.object({
  storiesCount: z.number(),
  bookmarksCount: z.number(),
  commentsCount: z.number(),
  viewsCount: z.number(),
  isBookmarked: z.boolean().optional(),
});

export const ProjectSchema = z.object({
  id: z.number(),
  creatorId: z.number(),
  title: z.string(),
  description: z.string(),
  coverImage: z.string().nullable(),
  status: z.enum(["draft", "published"]),
  categoryId: z.number(),
  viewCount: z.number(),
  storyCount: z.number(),
  bookmarkCount: z.number(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  creator: ProjectCreatorSchema.optional(),
  stats: ProjectStatsSchema.optional(),
});

export const CursorPaginationSchema = z.object({
  nextCursor: z.string().nullable(),
  hasNext: z.boolean(),
  limit: z.number(),
});

export const ProjectListResponseSchema = z.object({
  data: z.array(ProjectSchema),
  pagination: CursorPaginationSchema,
});
