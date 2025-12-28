import {
  bigint,
  bigserial,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  conceptDifficultyEnum,
  conceptRelationTypeEnum,
  conceptReviewRatingEnum,
  conceptSessionLinkTypeEnum,
  sessionConceptRoleEnum,
  tagSourceEnum,
} from "./enums";
import { planSessions } from "./curriculum";
import { users } from "./identity";
import { outlineNodes } from "./materials";
import { sessionRuns } from "./sessions";
import { spaces } from "./space";
import { tags } from "./tags";
import { timestamps } from "./shared";

/* ========== 8) Concepts ========== */

export const concepts = pgTable(
  "concepts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spaceId: bigint("space_id", { mode: "number" })
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    oneLiner: text("one_liner").notNull(),
    ariNoteMd: text("ari_note_md").notNull(),
    difficulty: conceptDifficultyEnum("difficulty"),
    lastLearnedAt: timestamp("last_learned_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastReviewedAt: timestamp("last_reviewed_at", {
      withTimezone: true,
      mode: "date",
    }),
    srsDueAt: timestamp("srs_due_at", { withTimezone: true, mode: "date" }),
    srsStateJson: jsonb("srs_state_json").$type<Record<string, unknown>>(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("concepts_public_id_unique").on(table.publicId),
    index("concepts_space_id_idx").on(table.spaceId),
    index("concepts_user_id_idx").on(table.userId),
    index("concepts_space_id_title_idx").on(table.spaceId, table.title),
  ],
);

export const conceptTags = pgTable(
  "concept_tags",
  {
    conceptId: bigint("concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    source: tagSourceEnum("source").notNull(),
    confidence: numeric("confidence"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conceptId, table.tagId] }),
    index("concept_tags_concept_id_idx").on(table.conceptId),
  ],
);

export const conceptSessionLinks = pgTable(
  "concept_session_links",
  {
    conceptId: bigint("concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .notNull()
      .references(() => sessionRuns.id, { onDelete: "cascade" }),
    linkType: conceptSessionLinkTypeEnum("link_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.conceptId, table.sessionRunId, table.linkType],
    }),
    index("concept_session_links_concept_id_idx").on(table.conceptId),
    index("concept_session_links_run_id_idx").on(table.sessionRunId),
  ],
);

export const conceptRelations = pgTable(
  "concept_relations",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    spaceId: bigint("space_id", { mode: "number" })
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    fromConceptId: bigint("from_concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    toConceptId: bigint("to_concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    relationType: conceptRelationTypeEnum("relation_type").notNull(),
    weight: numeric("weight"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("concept_relations_space_id_idx").on(table.spaceId),
    index("concept_relations_from_idx").on(table.fromConceptId),
  ],
);

export const conceptReviews = pgTable(
  "concept_reviews",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conceptId: bigint("concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    sessionRunId: bigint("session_run_id", { mode: "number" }).references(
      () => sessionRuns.id,
      { onDelete: "set null" },
    ),
    rating: conceptReviewRatingEnum("rating").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    nextDueAt: timestamp("next_due_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    intervalDays: integer("interval_days").notNull(),
    easeFactor: numeric("ease_factor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("concept_reviews_concept_id_idx").on(table.conceptId),
    index("concept_reviews_reviewed_at_idx").on(table.reviewedAt),
  ],
);

export const conceptTopicLinks = pgTable(
  "concept_topic_links",
  {
    conceptId: bigint("concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    outlineNodeId: uuid("outline_node_id")
      .notNull()
      .references(() => outlineNodes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conceptId, table.outlineNodeId] }),
    index("concept_topic_links_concept_id_idx").on(table.conceptId),
  ],
);

export const sessionConcepts = pgTable(
  "session_concepts",
  {
    sessionId: bigint("session_id", { mode: "number" })
      .notNull()
      .references(() => planSessions.id, { onDelete: "cascade" }),
    conceptId: bigint("concept_id", { mode: "number" })
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    role: sessionConceptRoleEnum("role").notNull(),
    weight: numeric("weight"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.conceptId] }),
    index("session_concepts_session_id_idx").on(table.sessionId),
  ],
);
