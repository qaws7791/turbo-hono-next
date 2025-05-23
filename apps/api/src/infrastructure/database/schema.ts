import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// --- Enum Definitions ---
// Drizzle ORM의 pgEnum은 DB에 실제 Enum 타입을 생성합니다.

// 사용자 역할 (플랫폼 유저 역할만 여기 정의. admin은 별도 테이블)
export const userRoleEnum = pgEnum("user_role", ["user", "creator"]);

// 크리에이터 계정 상태
export const creatorStatusEnum = pgEnum("creator_status", [
  "pending", // 가입 신청 후 관리자 승인 대기
  "approved", // 관리자 승인 완료
  "rejected", // 관리자 반려
  "active", // 승인 후 정상 활동 가능
  "inactive", // 관리자에 의해 비활성화됨 (일시적)
  "suspended", // 관리자에 의해 정지됨 (보안, 정책 위반 등)
]);

// 스토리 상태
export const storiesStatusEnum = pgEnum("story_status", [
  "published", // 발행됨 (사용자에게 공개)
  "hidden", // 관리자에 의해 숨김
  "deleted", // (소프트 삭제) 삭제됨
]);

// 스토리 반응 유형 (부정적인 반응은 피하고 긍정적 반응 위주로 정의)
export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "heart",
  "clap",
  "fire",
  "idea",
]);

// 큐레이션 아이템 유형
export const curationItemTypeEnum = pgEnum("curation_item_type", [
  "creator",
  "story",
]);

// --- Table Definitions ---

// 플랫폼 사용자 테이블 (소셜 로그인 유저의 기본 정보)
export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(), // 소셜 로그인에서 제공되는 이름
    email: varchar("email", { length: 255 }).unique(), // 소셜 로그인에서 제공되는 이메일 (unique, notNull은 Provider 설정에 따라 유연하게)
    emailVerified: timestamp("email_verified", { withTimezone: true }), // 기본값 제거
    profileImageUrl: varchar("profile_image_url", { length: 255 }), // 소셜 로그인에서 제공되는 프로필 이미지
    role: userRoleEnum("role").notNull().default("user"), // 'user' 또는 'creator'
    status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'inactive', 'suspended' 등

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // <-- New API Syntax
    index("users_email_idx").on(table.email),
    index("users_role_status_idx").on(table.role, table.status),
  ],
);

// 소셜 계정 정보 테이블 (플랫폼 사용자의 OAuth 계정 정보)
export const accounts = pgTable(
  "accounts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull(), // users.id 참조
    providerId: varchar("provider_id", { length: 50 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    password: varchar("password", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    unique("accounts_provider_provider_account_id_unique").on(
      table.providerId,
      table.providerAccountId,
    ),
    index("accounts_user_id_idx").on(table.userId),
  ],
);

// 플랫폼 사용자 세션 테이블 (플랫폼 유저 로그인 세션)
export const sessions = pgTable(
  "sessions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull(), // users.id 참조
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

// 관리자 사용자 테이블 (어드민 유저의 기본 정보 및 로그인 정보)
export const adminUsers = pgTable(
  "admin_users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: varchar("username", { length: 100 }).notNull().unique(), // 로그인 시 사용할 아이디
    passwordHash: varchar("password_hash", { length: 255 }).notNull(), // 저장 시 반드시 해싱

    name: varchar("name", { length: 255 }).notNull(), // 관리자 실제 이름
    email: varchar("email", { length: 255 }).unique(), // 관리자 연락용 이메일

    // 관리자 역할 (예: 최고 관리자, 콘텐츠 관리자 등 필요시 세분화)
    role: varchar("role", { length: 50 }).notNull().default("admin"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // <-- New API Syntax
    index("admin_users_username_idx").on(table.username),
    index("admin_users_email_idx").on(table.email),
    index("admin_users_role_idx").on(table.role),
  ],
);

// 관리자 세션 테이블 (어드민 유저 로그인 세션)
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    adminUserId: integer("admin_user_id").notNull(), // 이 세션에 연결된 관리자 유저 ID
    token: varchar("token", { length: 255 }).notNull().unique(), // 세션 토큰 (인증 헤더에 사용)

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // 세션 만료 시간
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // 선택적 정보
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
  },
  (table) => [
    // <-- New API Syntax
    foreignKey({
      columns: [table.adminUserId],
      foreignColumns: [adminUsers.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
    index("admin_sessions_admin_user_id_idx").on(table.adminUserId),
    index("admin_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

// 크리에이터 테이블 (플랫폼 사용자의 특정 역할)
// users 테이블과 1:1 관계 (users.id를 creators.userId가 참조)
export const creators = pgTable(
  "creators",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().unique(),
    brandName: varchar("brand_name", { length: 255 }).notNull().unique(),
    introduction: text("introduction"),
    // 사업자 정보 추가
    businessNumber: varchar("business_number", { length: 20 }), // 사업자등록번호
    businessName: varchar("business_name", { length: 255 }), // 상호
    ownerName: varchar("owner_name", { length: 100 }), // 대표자명
    // 활동 지역 정규화
    regionId: integer("region_id"), // regions.id 참조 (외래키)
    // 기존 location 필드는 삭제 또는 regionId로 대체
    // location: varchar("location", { length: 255 }),
    contactInfo: varchar("contact_info", { length: 255 }),
    applicationStatus: creatorStatusEnum("application_status")
      .notNull()
      .default("pending"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    // 활동 지역 외래키 추가
    foreignKey({
      columns: [table.regionId],
      foreignColumns: [regions.id],
    }).onDelete("set null"),
    index("creators_user_id_idx").on(table.userId),
    index("creators_brand_name_idx").on(table.brandName),
    index("creators_application_status_idx").on(table.applicationStatus),
    index("creators_region_id_idx").on(table.regionId),
  ],
);

// 지역 테이블
export const regions = pgTable(
  "regions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    parentId: integer("parent_id"),
  },
  (table) => [
    // <-- New API Syntax
    foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }), // <-- Table level FK defined in array
  ],
);

// 카테고리 테이블
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

// 크리에이터-카테고리 연결 테이블 (다대다 관계)
export const creatorCategories = pgTable(
  "creator_categories",
  {
    creatorId: integer("creator_id").notNull(), // creators.id 참조
    categoryId: integer("category_id").notNull(), // categories.id 참조
  },
  (table) => [
    // <-- New API Syntax
    primaryKey({ columns: [table.creatorId, table.categoryId] }), // <-- Table level PK defined in array
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creators.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
  ],
);

// 스토리 테이블
export const stories = pgTable(
  "stories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    authorId: integer("author_id").notNull(), // 작성자 (creators.id 참조)
    title: varchar("title", { length: 255 }).notNull(),
    coverImageUrl: varchar("cover_image_url", { length: 255 }),
    content: jsonb("content").notNull(),
    contentText: text("content_text").notNull(),
    status: storiesStatusEnum("status").notNull().default("published"), // 'draft', 'published', 'hidden', 'deleted'

    regionId: integer("region_id"), // 스토리 관련 지역 (regions.id 참조)
    categoryId: integer("category_id"), // 스토리 관련 카테고리 (categories.id 참조)

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }), // 발행 시간
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // <-- New API Syntax
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [creators.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
    foreignKey({
      columns: [table.regionId],
      foreignColumns: [regions.id],
    }).onDelete("set null"), // <-- Table level FK defined in array
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }).onDelete("set null"), // <-- Table level FK defined in array
    index("stories_status_idx").on(table.status),
    index("stories_created_at_idx").on(table.createdAt),
    index("stories_published_at_idx").on(table.publishedAt),
    index("stories_author_status_idx").on(table.authorId, table.status),
  ],
);

// 스토리 반응 (이모지) 테이블
// 유저(users.id)가 특정 스토리(stories.id)에 특정 타입으로 반응
export const reactions = pgTable(
  "reactions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    storyId: integer("story_id").notNull(),
    userId: integer("user_id").notNull(), // users.id 참조
    reactionType: reactionTypeEnum("reaction_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.storyId],
      foreignColumns: [stories.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    unique("reactions_story_id_user_id_unique").on(table.storyId, table.userId),
    index("reactions_story_id_type_idx").on(table.storyId, table.reactionType),
    index("reactions_user_id_idx").on(table.userId),
  ],
);

// 팔로우 관계 테이블
// 유저(users.id)가 크리에이터(creators.id)를 팔로우
export const follows = pgTable(
  "follows",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    followerId: integer("follower_id").notNull(), // users.id 참조
    followingId: integer("following_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.followerId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.followingId],
      foreignColumns: [creators.id],
    }).onDelete("cascade"),
    unique("follows_follower_following_unique").on(
      table.followerId,
      table.followingId,
    ),
    index("follows_follower_id_idx").on(table.followerId),
    index("follows_following_id_idx").on(table.followingId),
  ],
);

// 큐레이션 영역 테이블
export const curationSpots = pgTable("curation_spots", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
});

// 큐레이션 아이템 테이블
// 큐레이션 아이템으로 포함되는 크리에이터(creators.id) 또는 스토리(stories.id)
export const curationItems = pgTable(
  "curation_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    spotId: integer("spot_id").notNull(), // curation_spots.id 참조
    itemType: curationItemTypeEnum("item_type").notNull(), // 'creator' 또는 'story'
    creatorId: integer("creator_id"), // creators.id 참조 (itemType이 'creator'일 경우)
    storyId: integer("story_id"), // stories.id 참조 (itemType이 'story'일 경우)
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // <-- New API Syntax
    foreignKey({
      columns: [table.spotId],
      foreignColumns: [curationSpots.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creators.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
    foreignKey({
      columns: [table.storyId],
      foreignColumns: [stories.id],
    }).onDelete("cascade"), // <-- Table level FK defined in array
    unique("curation_items_spot_id_creator_id_unique").on(
      table.spotId,
      table.creatorId,
    ), // <-- Table level unique defined in array
    unique("curation_items_spot_id_story_id_unique").on(
      table.spotId,
      table.storyId,
    ), // <-- Table level unique defined in array
    index("curation_items_spot_id_position_idx").on(
      table.spotId,
      table.position,
    ),
  ],
);

// 이메일 인증 토큰 테이블
export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull(), // users.id 참조
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("email_verification_tokens_user_id_idx").on(table.userId),
    index("email_verification_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

// 객체 테이블
export const objects = pgTable(
  "objects",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull(), // users.id 참조
    bucket: text("bucket").notNull(),
    key: text("key").notNull().unique(),
    contentType: text("content_type"),
    size: bigint({
      mode: "number",
    }),
    isUploaded: boolean("is_uploaded").notNull().default(false),
    customMetadata: jsonb("custom_metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("objects_user_id_idx").on(table.userId),
    index("objects_bucket_key_idx").on(table.bucket, table.key),
    index("objects_is_uploaded_idx").on(table.isUploaded),
  ],
);

// --- Relations Definitions ---
// Drizzle ORM 쿼리 시 관계를 쉽게 탐색하기 위한 정의
// Relations 정의 문법은 변경 없음

export const usersRelations = relations(users, ({ one, many }) => ({
  // 플랫폼 유저와 소셜 계정은 1:N 관계 (한 유저가 여러 소셜 계정 연결 가능)
  accounts: many(accounts),
  // 플랫폼 유저와 세션은 1:N 관계
  sessions: many(sessions),
  // 플랫폼 유저와 팔로우 관계 (팔로우 하는 유저)는 1:N 관계
  following: many(follows, { relationName: "follower" }),
  // 플랫폼 유저와 반응은 1:N 관계
  reactions: many(reactions),
  // 플랫폼 유저 중 크리에이터 역할인 경우, 크리에이터 프로필과 1:1 관계 (userId로 연결)
  creatorProfile: one(creators, {
    fields: [users.id],
    references: [creators.userId],
  }),
  emailVerificationTokens: many(emailVerificationTokens), // 추가
  objects: many(objects),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  // 소셜 계정은 하나의 플랫폼 유저에게 속함
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  // 플랫폼 유저 세션은 하나의 플랫폼 유저에게 속함
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  // 관리자 유저는 관리자 세션과 1:N 관계
  adminSessions: many(adminSessions),
  // 관리자 유저와 관리 로그 등 필요시 다른 테이블과 관계 정의
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  // 관리자 세션은 하나의 관리자 유저에게 속함
  adminUser: one(adminUsers, {
    fields: [adminSessions.adminUserId],
    references: [adminUsers.id],
  }),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  // 크리에이터 프로필은 하나의 플랫폼 유저에게 속함
  user: one(users, {
    fields: [creators.userId],
    references: [users.id],
  }),
  // 크리에이터와 스토리은 1:N 관계
  stories: many(stories),
  // 크리에이터와 카테고리는 N:M 관계 (creatorCategories 조인 테이블 통해)
  creatorCategories: many(creatorCategories),
  // 크리에이터와 팔로우 관계 (팔로우 받는 크리에이터)는 1:N 관계
  followers: many(follows, { relationName: "following" }),
  // 크리에이터와 큐레이션 아이템은 1:N 관계 (큐레이션 아이템으로 포함된 경우)
  curationItems: many(curationItems),
}));

export const regionsRelations = relations(regions, ({ one, many }) => ({
  // 지역과 상위 지역은 1:1 관계 (셀프 참조)
  parent: one(regions, {
    fields: [regions.parentId],
    references: [regions.id],
  }),
  // 지역과 하위 지역은 1:N 관계 (셀프 참조 역방향)
  children: many(regions),
  // 지역과 스토리은 1:N 관계
  stories: many(stories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  // 카테고리와 크리에이터는 N:M 관계 (creatorCategories 조인 테이블 통해)
  creatorCategories: many(creatorCategories),
  // 카테고리와 스토리은 1:N 관계
  stories: many(stories),
}));

export const creatorCategoriesRelations = relations(
  creatorCategories,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorCategories.creatorId],
      references: [creators.id],
    }),
    category: one(categories, {
      fields: [creatorCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const storiesRelations = relations(stories, ({ one, many }) => ({
  // 스토리과 작성자(크리에이터)는 N:1 관계
  author: one(creators, {
    fields: [stories.authorId],
    references: [creators.id],
  }),
  // 스토리과 반응은 1:N 관계
  reactions: many(reactions),
  // 스토리과 지역은 N:1 관계
  region: one(regions, {
    fields: [stories.regionId],
    references: [regions.id],
  }),
  // 스토리과 카테고리는 N:1 관계
  category: one(categories, {
    fields: [stories.categoryId],
    references: [categories.id],
  }),
  // 스토리과 큐레이션 아이템은 1:N 관계 (큐레이션 아이템으로 포함된 경우)
  curationItems: many(curationItems),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  // 반응은 하나의 스토리에 속함
  story: one(stories, {
    fields: [reactions.storyId],
    references: [stories.id],
  }),
  // 반응은 하나의 유저에게 속함 (플랫폼 유저)
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  // 팔로우하는 유저는 하나의 플랫폼 유저
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  // 팔로우 받는 대상은 하나의 크리에이터
  following: one(creators, {
    fields: [follows.followingId],
    references: [creators.id],
    relationName: "following",
  }),
}));

export const curationSpotsRelations = relations(curationSpots, ({ many }) => ({
  // 큐레이션 영역은 여러 큐레이션 아이템을 가짐
  items: many(curationItems),
}));

export const curationItemsRelations = relations(curationItems, ({ one }) => ({
  // 큐레이션 아이템은 하나의 큐레이션 영역에 속함
  spot: one(curationSpots, {
    fields: [curationItems.spotId],
    references: [curationSpots.id],
  }),
  // 큐레이션 아이템이 크리에이터인 경우, 해당 크리에이터
  creator: one(creators, {
    fields: [curationItems.creatorId],
    references: [creators.id],
  }),
  // 큐레이션 아이템이 스토리인 경우, 해당 스토리
  story: one(stories, {
    fields: [curationItems.storyId],
    references: [stories.id],
  }),
}));

export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const objectsRelations = relations(objects, ({ one }) => ({
  user: one(users, {
    fields: [objects.userId],
    references: [users.id],
  }),
}));
