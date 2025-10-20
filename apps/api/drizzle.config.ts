import { defineConfig } from "drizzle-kit";
import { CONFIG } from "./src/config";
export default defineConfig({
  dialect: "postgresql",
  schema: "../packages/database/src/schema.ts",
  out: "../packages/database/migrations",
  dbCredentials: {
    url: CONFIG.DATABASE_URL,
  },
});
