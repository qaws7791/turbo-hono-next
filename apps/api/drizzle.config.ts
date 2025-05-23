import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:zxY5lyfs7Hy6Uol@localhost:5432/postgres",
  },
});
