import {
  createChatMessageRoute,
  createChatThreadRoute,
  listChatMessagesRoute,
} from "@repo/api-spec";

import { jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import {
  createChatMessage,
  createChatThread,
  listChatMessages,
} from "../modules/chat";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerChatRoutes(app: OpenAPIHono): void {
  app.openapi(
    { ...createChatThreadRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return jsonResult(c, createChatThread(auth.user.id, body), 201);
    },
  );

  app.openapi(
    { ...createChatMessageRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { threadId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        createChatMessage(auth.user.id, threadId, body),
        200,
      );
    },
  );

  app.openapi(
    { ...listChatMessagesRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { threadId } = c.req.valid("param");
      return jsonResult(c, listChatMessages(auth.user.id, threadId), 200);
    },
  );
}
