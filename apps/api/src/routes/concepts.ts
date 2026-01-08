import {
  createConceptReviewRoute,
  getConceptDetailRoute,
  listConceptLibraryRoute,
  listConceptsRoute,
  searchConceptsRoute,
} from "@repo/api-spec";

import { jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import {
  createConceptReview,
  getConceptDetail,
  listConceptLibrary,
  listConcepts,
  searchConcepts,
} from "../modules/concept";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerConceptRoutes(app: OpenAPIHono): void {
  app.openapi(
    { ...listConceptLibraryRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      return jsonResult(
        c,
        listConceptLibrary(auth.user.id, {
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          search: query.search,
          reviewStatus: query.reviewStatus,
          spaceIds: query.spaceIds,
        }),
        200,
      );
    },
  );

  app.openapi(
    { ...listConceptsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { spaceId } = c.req.valid("param");
      const query = c.req.valid("query");

      return jsonResult(
        c,
        listConcepts(auth.user.id, {
          spaceId,
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          search: query.search,
          reviewStatus: query.reviewStatus,
        }),
        200,
      );
    },
  );

  app.openapi(
    { ...getConceptDetailRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { conceptId } = c.req.valid("param");
      return jsonResult(c, getConceptDetail(auth.user.id, conceptId), 200);
    },
  );

  app.openapi(
    { ...createConceptReviewRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { conceptId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        createConceptReview(auth.user.id, conceptId, body),
        201,
      );
    },
  );

  app.openapi(
    { ...searchConceptsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");
      return jsonResult(
        c,
        searchConcepts(auth.user.id, {
          q: query.q,
          spaceIds: query.spaceIds,
        }),
        200,
      );
    },
  );
}
