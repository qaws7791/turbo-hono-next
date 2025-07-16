import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["user", "creator"]);

export const magicLinkTypeEnum = pgEnum("magic_link_type", [
  "signup",
  "signin",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
]);
export const reactionTypeEnum = pgEnum("reaction_type", [
  "clap",
  "heart",
  "wow",
  "think",
  "idea",
]);
export const bookmarkTargetTypeEnum = pgEnum("bookmark_target_type", [
  "story",
  "project",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "story_reaction",
  "story_comment",
  "project_comment",
  "new_story",
  "new_follower",
]);
export const creatorCategoryEnum = pgEnum("creator_category", [
  "art",
  "craft",
  "music",
  "photo",
  "writing",
  "design",
  "tech",
  "cooking",
  "other",
]);
export const commentableTypeEnum = pgEnum("commentable_type", [
  "story",
  "project",
]);

// ============================================================================
// CORE USER TABLES
// ============================================================================

/**
 * 사용자 기본 정보 테이블
 * - 매직링크와 카카오 OAuth 모두 지원
 * - username은 unique하며 URL에 사용됨
 */
export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 50 }).unique().notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    profileImage: text("profile_image")
      .notNull()
      .default(
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      ),
    bio: text("bio").notNull().default(""),
    role: userRoleEnum("role").notNull().default("user"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    index("users_role_idx").on(table.role),
  ],
);

/**
 * 소셜 계정 정보 테이블
 */
export const accounts = pgTable(
  "accounts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_provider_idx").on(table.provider),
    index("accounts_provider_account_id_idx").on(table.providerAccountId),
  ],
);

/**
 * 크리에이터 확장 정보 테이블
 * - users 테이블과 1:1 관계
 * - role이 'creator'인 경우에만 존재
 */
export const creators = pgTable(
  "creators",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    brandName: varchar("brand_name", { length: 100 }).notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    address: text("address"),
    category: creatorCategoryEnum("category").notNull(), // 하나의 카테고리만 선택
    socialLinks: jsonb("social_links").$type<Record<string, string>>(), // { instagram: 'url', website: 'url' }
    description: text("description").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("creators_user_id_idx").on(table.userId),
    index("creators_region_idx").on(table.region),
    index("creators_category_idx").on(table.category),
  ],
);

// ============================================================================
// AUTHENTICATION TABLES
// ============================================================================

/**
 * 사용자 세션 테이블
 * - 랜덤 ID를 기반으로 한 서버 세션 관리
 * - 보안을 위해 세션 무효화 가능
 */
export const sessions = pgTable(
  "sessions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

/**
 * 매직링크 토큰 테이블
 * - 이메일 인증용 일회성 토큰
 * - 회원가입과 로그인 모두 지원
 */
export const magicLinks = pgTable(
  "magic_links",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    type: magicLinkTypeEnum("type").notNull(),

    // 토큰 상태
    isUsed: boolean("is_used").notNull().default(false),
    usedAt: timestamp("used_at"),

    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("magic_links_email_idx").on(table.email),
    uniqueIndex("magic_links_token_idx").on(table.token),
    index("magic_links_type_idx").on(table.type),
    index("magic_links_expires_at_idx").on(table.expiresAt),
  ],
);

// ============================================================================
// CONTENT TABLES
// ============================================================================

/**
 * 카테고리 테이블
 * - 프로젝트에 적용
 */
export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    description: text("description"),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("categories_name_idx").on(table.name),
    index("categories_slug_idx").on(table.slug),
    index("categories_created_at_idx").on(table.createdAt),
    index("categories_updated_at_idx").on(table.updatedAt),
  ],
);

/**
 * 프로젝트 테이블
 * - 크리에이터의 창작 프로젝트
 * - 여러 스토리를 포함하는 컨테이너 역할
 */
export const projects = pgTable(
  "projects",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    creatorId: integer("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    coverImage: text("cover_image"), // Cloudflare Images URL
    status: contentStatusEnum("status").notNull().default("draft"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    // 통계 캐시 (성능 최적화용)
    viewCount: integer("view_count").notNull().default(0),
    storyCount: integer("story_count").notNull().default(0),
    bookmarkCount: integer("bookmark_count").notNull().default(0),

    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("projects_creator_id_idx").on(table.creatorId),
    index("projects_status_idx").on(table.status),
    index("projects_published_at_idx").on(table.publishedAt),
    index("projects_category_id_idx").on(table.categoryId),
  ],
);

/**
 * 스토리 테이블
 * - 프로젝트 내의 개별 창작 에피소드
 * - TipTap 에디터의 JSON 데이터 저장
 */
export const stories = pgTable(
  "stories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 200 }).notNull(),
    content: jsonb("content").notNull(), // TipTap JSON 데이터
    contextText: text("context_text").notNull(), // 검색용 텍스트
    tags: varchar("tags", { length: 50 }).array(),
    status: contentStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("stories_project_id_idx").on(table.projectId),
    index("stories_status_idx").on(table.status),
    index("stories_published_at_idx").on(table.publishedAt),
    index("stories_tags_idx").on(table.tags),
  ],
);

// ============================================================================
// INTERACTION TABLES
// ============================================================================

/**
 * 반응 테이블 (5가지 이모지 반응)
 * - 한 사용자당 스토리마다 하나의 반응만 가능
 */
export const reactions = pgTable(
  "reactions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: integer("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    type: reactionTypeEnum("type").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // 사용자당 스토리마다 하나의 반응만 허용
    uniqueIndex("reactions_user_story_idx").on(table.userId, table.storyId),
    index("reactions_story_id_idx").on(table.storyId),
    index("reactions_user_id_idx").on(table.userId),
  ],
);

/**
 * 댓글 테이블
 * - 스토리와 프로젝트 모두에 댓글 가능
 * - 단순한 댓글만 지원 (대댓글 없음)
 */
export const comments = pgTable(
  "comments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // 댓글 대상 (스토리 또는 프로젝트)
    commentableId: integer("commentable_id").notNull(),
    commentableType: commentableTypeEnum("commentable_type").notNull(),

    content: text("content").notNull(),

    // 메타데이터
    isEdited: boolean("is_edited").notNull().default(false),
    editedAt: timestamp("edited_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("comments_user_id_idx").on(table.userId),
    index("comments_commentable_id_idx").on(table.commentableId),
    index("comments_created_at_idx").on(table.createdAt),
  ],
);

/**
 * 북마크 테이블
 * - 스토리와 프로젝트 모두 북마크 가능
 */
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // 북마크 대상
    targetId: integer("target_id").notNull(),
    targetType: bookmarkTargetTypeEnum("target_type").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // 사용자당 대상마다 하나의 북마크만 허용
    uniqueIndex("bookmarks_user_target_idx").on(
      table.userId,
      table.targetId,
      table.targetType,
    ),
    index("bookmarks_user_id_idx").on(table.userId),
    index("bookmarks_target_idx").on(table.targetId, table.targetType),
    index("bookmarks_created_at_idx").on(table.createdAt),
  ],
);

/**
 * 팔로우 관계 테이블
 * - 사용자 간 팔로우 관계
 */
export const follows = pgTable(
  "follows",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // 같은 관계 중복 방지
    uniqueIndex("follows_follower_following_idx").on(
      table.followerId,
      table.followingId,
    ),
    index("follows_follower_id_idx").on(table.followerId),
    index("follows_following_id_idx").on(table.followingId),
    index("follows_created_at_idx").on(table.createdAt),
  ],
);

// ============================================================================
// NOTIFICATION TABLE
// ============================================================================

/**
 * 알림 테이블
 * - 폴링 방식으로 조회되는 알림 시스템
 */
export const notifications = pgTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),

    // 알림 관련 엔티티들
    actorId: integer("actor_id").references(() => users.id, {
      onDelete: "cascade",
    }), // 알림을 발생시킨 사용자
    targetId: integer("target_id"), // 관련된 스토리/프로젝트 ID
    targetType: varchar("target_type", { length: 20 }), // 'story' | 'project' | 'user'

    // 알림 상태
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_type_idx").on(table.type),
    index("notifications_is_read_idx").on(table.isRead),
    index("notifications_actor_id_idx").on(table.actorId),
    index("notifications_created_at_idx").on(table.createdAt),
    // 읽지 않은 알림 조회용 복합 인덱스
    index("notifications_user_read_idx").on(table.userId, table.isRead),
  ],
);

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer("size").notNull(),
    url: text("url").notNull(),
    uploadedBy: integer("uploaded_by").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("files_user_id_idx").on(table.uploadedBy),
    index("files_created_at_idx").on(table.createdAt),
  ],
);

// ============================================================================
// ANALYTICS TABLES (통계용)
// ============================================================================

/**
 * 일별 통계 테이블
 * - 크리에이터 대시보드용 집계 데이터
 * - 배치 작업으로 매일 집계
 */
export const dailyStats = pgTable(
  "daily_stats",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD 형식

    // 통계 데이터
    views: integer("views").notNull().default(0),
    reactions: integer("reactions").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    bookmarks: integer("bookmarks").notNull().default(0),
    followers: integer("followers").notNull().default(0), // 해당일의 총 팔로워 수

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // 사용자당 날짜마다 하나의 레코드만 허용
    uniqueIndex("daily_stats_user_date_idx").on(table.userId, table.date),
    index("daily_stats_user_id_idx").on(table.userId),
    index("daily_stats_date_idx").on(table.date),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  creator: one(creators, {
    fields: [users.id],
    references: [creators.userId],
  }),
  sessions: many(sessions),
  projects: many(projects),
  reactions: many(reactions),
  comments: many(comments),
  bookmarks: many(bookmarks),
  notifications: many(notifications),
  dailyStats: many(dailyStats),

  // 파일
  files: many(files),

  // 팔로우 관계
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),

  // 알림에서 actor로 참조되는 경우
  triggeredNotifications: many(notifications, { relationName: "actor" }),
}));

export const creatorsRelations = relations(creators, ({ one }) => ({
  user: one(users, {
    fields: [creators.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id],
  }),
  stories: many(stories),
  comments: many(comments),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  project: one(projects, {
    fields: [stories.projectId],
    references: [projects.id],
  }),
  reactions: many(reactions),
  comments: many(comments),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [reactions.storyId],
    references: [stories.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "actor",
  }),
}));

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
  user: one(users, {
    fields: [dailyStats.userId],
    references: [users.id],
  }),
}));
