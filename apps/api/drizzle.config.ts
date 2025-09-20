import { defineConfig } from "drizzle-kit";
import { CONFIG } from "./src/config";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    url: CONFIG.DATABASE_URL,
  },
});
