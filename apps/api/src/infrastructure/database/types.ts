import { initializeDatabase } from "@/infrastructure/database";
import {
  accounts,
  adminSessions,
  adminUsers,
  categories,
  creators,
  creatorStatusEnum,
  curationItems,
  curationSpots,
  emailVerificationTokens,
  files,
  follows,
  reactions,
  sessions,
  sido,
  sigungu,
  stories,
  userRoleEnum,
  users,
} from "@/infrastructure/database/schema";

export type DbClient = ReturnType<typeof initializeDatabase>;

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type CreatorStatus = (typeof creatorStatusEnum.enumValues)[number];

// --- Type Definitions ---
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

export type AccountInsert = typeof accounts.$inferInsert;
export type AccountSelect = typeof accounts.$inferSelect;

export type SessionInsert = typeof sessions.$inferInsert;
export type SessionSelect = typeof sessions.$inferSelect;

export type AdminUserInsert = typeof adminUsers.$inferInsert;
export type AdminUserSelect = typeof adminUsers.$inferSelect;

export type AdminSessionInsert = typeof adminSessions.$inferInsert;
export type AdminSessionSelect = typeof adminSessions.$inferSelect;

export type CreatorInsert = typeof creators.$inferInsert;
export type CreatorSelect = typeof creators.$inferSelect;

export type SidoInsert = typeof sido.$inferInsert;
export type SidoSelect = typeof sido.$inferSelect;

export type SigunguInsert = typeof sigungu.$inferInsert;
export type SigunguSelect = typeof sigungu.$inferSelect;

export type CategoryInsert = typeof categories.$inferInsert;
export type CategorySelect = typeof categories.$inferSelect;

export type StoryInsert = typeof stories.$inferInsert;
export type StorySelect = typeof stories.$inferSelect;

export type ReactionInsert = typeof reactions.$inferInsert;
export type ReactionSelect = typeof reactions.$inferSelect;

export type FollowInsert = typeof follows.$inferInsert;
export type FollowSelect = typeof follows.$inferSelect;

export type CurationSpotInsert = typeof curationSpots.$inferInsert;
export type CurationSpotSelect = typeof curationSpots.$inferSelect;

export type CurationItemInsert = typeof curationItems.$inferInsert;
export type CurationItemSelect = typeof curationItems.$inferSelect;

export type EmailVerificationTokenInsert =
  typeof emailVerificationTokens.$inferInsert;
export type EmailVerificationTokenSelect =
  typeof emailVerificationTokens.$inferSelect;

export type FileInsert = typeof files.$inferInsert;
export type FileSelect = typeof files.$inferSelect;
