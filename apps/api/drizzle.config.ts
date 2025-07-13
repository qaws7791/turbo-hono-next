import { defineConfig } from "drizzle-kit";
import { DATABASE_CONFIG } from "./src/shared/config/database.config";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/database/schema.ts",
  dbCredentials: {
    url: DATABASE_CONFIG.DATABASE_URL,
  },
});
