import * as schema from "./schema";

export type User = typeof schema.users.$inferSelect;
export type UserInsert = typeof schema.users.$inferInsert;

export type Account = typeof schema.accounts.$inferSelect;
export type AccountInsert = typeof schema.accounts.$inferInsert;

export type Creator = typeof schema.creators.$inferSelect;
export type CreatorInsert = typeof schema.creators.$inferInsert;

export type Session = typeof schema.sessions.$inferSelect;
export type SessionInsert = typeof schema.sessions.$inferInsert;

export type MagicLink = typeof schema.magicLinks.$inferSelect;
export type MagicLinkInsert = typeof schema.magicLinks.$inferInsert;

export type Category = typeof schema.categories.$inferSelect;
export type CategoryInsert = typeof schema.categories.$inferInsert;

export type Project = typeof schema.projects.$inferSelect;
export type ProjectInsert = typeof schema.projects.$inferInsert;

export type Story = typeof schema.stories.$inferSelect;
export type StoryInsert = typeof schema.stories.$inferInsert;

export type Reaction = typeof schema.reactions.$inferSelect;
export type ReactionInsert = typeof schema.reactions.$inferInsert;

export type Comment = typeof schema.comments.$inferSelect;
export type CommentInsert = typeof schema.comments.$inferInsert;

export type Bookmark = typeof schema.bookmarks.$inferSelect;
export type BookmarkInsert = typeof schema.bookmarks.$inferInsert;

export type Follow = typeof schema.follows.$inferSelect;
export type FollowInsert = typeof schema.follows.$inferInsert;

export type Notification = typeof schema.notifications.$inferSelect;
export type NotificationInsert = typeof schema.notifications.$inferInsert;

export type DailyStat = typeof schema.dailyStats.$inferSelect;
export type DailyStatInsert = typeof schema.dailyStats.$inferInsert;
