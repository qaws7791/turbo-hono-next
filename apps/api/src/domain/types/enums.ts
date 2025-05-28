export const UserRole = {
  USER: "user",
  CREATOR: "creator",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const CreatorStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;
export type CreatorStatus = (typeof CreatorStatus)[keyof typeof CreatorStatus];

export const StoryStatus = {
  PUBLISHED: "published",
  HIDDEN: "hidden",
  DELETED: "deleted", // Soft delete
} as const;
export type StoryStatus = (typeof StoryStatus)[keyof typeof StoryStatus];

export const Reaction = {
  LIKE: "like",
  HEART: "heart",
  CLAP: "clap",
  FIRE: "fire",
  IDEA: "idea",
} as const;
export type Reaction = (typeof Reaction)[keyof typeof Reaction];

export const CurationItemType = {
  CREATOR: "creator",
  STORY: "story",
} as const;

export type CurationItemType =
  (typeof CurationItemType)[keyof typeof CurationItemType];
