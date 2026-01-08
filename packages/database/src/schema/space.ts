import {
  bigserial,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./identity";
import { timestamps } from "./shared";

/* ========== 2) Space ========== */

export const spaces = pgTable(
  "spaces",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").notNull().default("book"),
    color: text("color").notNull().default("blue"),
    sortOrder: integer("sort_order"),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("spaces_public_id_unique").on(table.publicId),
    index("spaces_user_id_idx").on(table.userId),
    index("spaces_user_id_created_at_idx").on(table.userId, table.createdAt),
  ],
);
