import {
  createSpaceRoute,
  deleteSpaceRoute,
  getSpaceRoute,
  listSpacesRoute,
  updateSpaceRoute,
} from "@repo/api-spec";

import { jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import {
  createSpace,
  deleteSpace,
  getSpace,
  listSpaces,
  updateSpace,
} from "../modules/space";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerSpaceRoutes(app: OpenAPIHono): void {
  app.openapi(
    { ...listSpacesRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      return jsonResult(c, listSpaces(auth.user.id), 200);
    },
  );

  app.openapi(
    { ...createSpaceRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return jsonResult(c, createSpace(auth.user.id, body), 201);
    },
  );

  app.openapi(
    { ...getSpaceRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { spaceId } = c.req.valid("param");
      return jsonResult(c, getSpace(auth.user.id, spaceId), 200);
    },
  );

  app.openapi(
    { ...updateSpaceRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { spaceId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, updateSpace(auth.user.id, spaceId, body), 200);
    },
  );

  app.openapi(
    { ...deleteSpaceRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { spaceId } = c.req.valid("param");
      return jsonResult(c, deleteSpace(auth.user.id, spaceId), 200);
    },
  );
}
