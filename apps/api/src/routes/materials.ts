import {
  completeMaterialUploadRoute,
  completeMaterialUploadStreamRoute,
  deleteMaterialRoute,
  getJobStatusRoute,
  getMaterialDetailRoute,
  initiateMaterialUploadRoute,
  listMaterialsRoute,
  updateMaterialTitleRoute,
} from "@repo/api-spec";
import { streamSSE } from "hono/streaming";

import { handleResult, jsonResult } from "../lib/result-handler";
import { throwAppError } from "../lib/result";
import { createRequireAuthMiddleware } from "../middleware/auth";
import { toApiErrorResponse } from "../middleware/error-handler";

import type { AppDeps } from "../app-deps";
import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerMaterialRoutes(app: OpenAPIHono, deps: AppDeps): void {
  const requireAuth = createRequireAuthMiddleware({
    config: deps.config,
    authService: deps.services.auth,
  });

  /* ========== 목록 조회 ========== */
  app.openapi(
    { ...listMaterialsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      const params = {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        status: query.status,
        search: query.search,
        sort: query.sort,
      };

      return jsonResult(
        c,
        deps.services.material.listMaterials(auth.user.id, params),
        200,
      );
    },
  );

  /* ========== 상세 조회 ========== */
  app.openapi(
    { ...getMaterialDetailRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { materialId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.material.getMaterialDetail(auth.user.id, materialId),
        200,
      );
    },
  );

  /* ========== 파일 업로드: 세션 시작 ========== */
  app.openapi(
    { ...initiateMaterialUploadRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.material.initiateMaterialUpload(auth.user.id, body),
        200,
      );
    },
  );

  /* ========== 파일 업로드: 완료 처리 ========== */
  app.openapi(
    { ...completeMaterialUploadRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return handleResult(
        deps.services.material.completeMaterialUpload(auth.user.id, body),
        (created) => {
          if (created.mode === "sync") {
            return c.json(
              {
                data: {
                  id: created.materialId,
                  title: created.title,
                  processingStatus: created.processingStatus,
                  summary: created.summary,
                },
              },
              201,
            );
          }

          return c.json(
            {
              data: {
                id: created.materialId,
                jobId: created.jobId,
                processingStatus: created.processingStatus,
              },
            },
            202,
          );
        },
      );
    },
  );

  /* ========== 파일 업로드: 완료 처리 (SSE 스트림) ========== */
  app.openapi(
    {
      ...completeMaterialUploadStreamRoute,
      middleware: [requireAuth] as const,
    },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      const requestId = c.get("requestId");

      return streamSSE(c, async (stream) => {
        try {
          const resultAsync =
            deps.services.material.completeMaterialUploadWithProgress(
              auth.user.id,
              body,
              async (step, progress) => {
                await stream.writeSSE({
                  event: "progress",
                  data: JSON.stringify({ step, progress }),
                });
              },
            );

          const resultResult = await resultAsync;
          if (resultResult.isErr()) {
            throwAppError(resultResult.error);
          }
          const result = resultResult.value;

          await stream.writeSSE({
            event: "complete",
            data: JSON.stringify({
              data: {
                id: result.materialId,
                title: result.mode === "sync" ? result.title : undefined,
                processingStatus: result.processingStatus,
                summary: result.mode === "sync" ? result.summary : null,
              },
            }),
          });
        } catch (error) {
          await stream.writeSSE({
            event: "error",
            data: JSON.stringify(toApiErrorResponse(error, requestId).body),
          });
        }
      });
    },
  );

  /* ========== 삭제 ========== */
  app.openapi(
    { ...deleteMaterialRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { materialId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.material.deleteMaterial(auth.user.id, materialId),
        200,
      );
    },
  );

  /* ========== 제목 수정 ========== */
  app.openapi(
    { ...updateMaterialTitleRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { materialId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.material.updateMaterialTitle(
          auth.user.id,
          materialId,
          body.title,
        ),
        200,
      );
    },
  );

  /* ========== 작업 상태 조회 ========== */
  app.openapi(
    { ...getJobStatusRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { jobId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.material.getJobStatus(auth.user.id, jobId),
        200,
      );
    },
  );
}
