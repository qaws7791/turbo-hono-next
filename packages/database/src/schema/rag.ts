import {
  index,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

/* used in langchain - don't change the table */
export const ragCollections = pgTable(
  "rag_collections",
  {
    uuid: uuid("uuid").primaryKey().notNull().defaultRandom(),
    name: varchar("name"),
    cmetadata: jsonb("cmetadata"),
  },
  (table) => [index("idx_rag_collections_name").on(table.name)],
);

export const ragDocuments = pgTable("rag_documents", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  content: text("content"),
  metadata: jsonb("metadata"),
  vector: vector("vector", { dimensions: 1536 }),
  collectionId: uuid("collection_id").references(() => ragCollections.uuid, {
    onDelete: "cascade",
  }),
});
