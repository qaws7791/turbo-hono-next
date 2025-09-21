import { serve } from "@hono/node-server";
import "dotenv/config";
import app from "./app";

export type { AppType } from "./app";

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
