import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);

export function initServerMsw() {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.VITE_MSW === "true"
  ) {
    server.listen({ onUnhandledRequest: "bypass" });
    console.log("✅ [MSW] Mock server started");
  }
}
