import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/infrastructure/database/schema.ts",
  out: "./src/infrastructure/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:zxY5lyfs7Hy6Uol@localhost:5432/postgres",
  },
});
