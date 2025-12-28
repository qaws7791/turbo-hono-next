import {
  bigint,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { chatMessageRoleEnum, chatScopeTypeEnum } from "./enums";
import { users } from "./identity";
import { materialChunks } from "./materials";
import { spaces } from "./space";

/* ========== 9) Chat ========== */

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spaceId: bigint("space_id", { mode: "number" })
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    scopeType: chatScopeTypeEnum("scope_type").notNull(),
    scopeId: bigint("scope_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("chat_threads_user_id_idx").on(table.userId),
    index("chat_threads_space_id_idx").on(table.spaceId),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => chatThreads.id, { onDelete: "cascade" }),
    role: chatMessageRoleEnum("role").notNull(),
    contentMd: text("content_md").notNull(),
    tokenCount: integer("token_count"),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("chat_messages_thread_id_created_at_idx").on(
      table.threadId,
      table.createdAt,
    ),
  ],
);

export const chatCitations = pgTable(
  "chat_citations",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: uuid("message_id")
      .notNull()
      .references(() => chatMessages.id, { onDelete: "cascade" }),
    chunkId: uuid("chunk_id")
      .notNull()
      .references(() => materialChunks.id, { onDelete: "cascade" }),
    score: numeric("score"),
    quote: text("quote"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("chat_citations_message_id_idx").on(table.messageId)],
);
