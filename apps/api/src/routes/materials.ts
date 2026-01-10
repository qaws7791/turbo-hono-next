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
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/error-handler";
import {
  completeMaterialUpload,
  completeMaterialUploadWithProgress,
  deleteMaterial,
  getJobStatus,
  getMaterialDetail,
  initiateMaterialUpload,
  listMaterials,
  updateMaterialTitle,
} from "../modules/material";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerMaterialRoutes(app: OpenAPIHono): void {
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

      return jsonResult(c, listMaterials(auth.user.id, params), 200);
    },
  );

  /* ========== 상세 조회 ========== */
  app.openapi(
    { ...getMaterialDetailRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { materialId } = c.req.valid("param");
      return jsonResult(c, getMaterialDetail(auth.user.id, materialId), 200);
    },
  );

  /* ========== 파일 업로드: 세션 시작 ========== */
  app.openapi(
    { ...initiateMaterialUploadRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return jsonResult(c, initiateMaterialUpload(auth.user.id, body), 200);
    },
  );

  /* ========== 파일 업로드: 완료 처리 ========== */
  app.openapi(
    { ...completeMaterialUploadRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return handleResult(
        completeMaterialUpload(auth.user.id, body),
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

      return streamSSE(c, async (stream) => {
        try {
          const result = await completeMaterialUploadWithProgress(
            auth.user.id,
            body,
            async (step, progress, message) => {
              await stream.writeSSE({
                event: "progress",
                data: JSON.stringify({ step, progress, message }),
              });
            },
          );

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
          const errorData =
            error instanceof ApiError
              ? { code: error.code, message: error.message }
              : {
                  code: "UNKNOWN_ERROR",
                  message:
                    error instanceof Error
                      ? error.message
                      : "알 수 없는 오류가 발생했습니다.",
                };

          await stream.writeSSE({
            event: "error",
            data: JSON.stringify(errorData),
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
      return jsonResult(c, deleteMaterial(auth.user.id, materialId), 200);
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
        updateMaterialTitle(auth.user.id, materialId, body.title),
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
      return jsonResult(c, getJobStatus(auth.user.id, jobId), 200);
    },
  );
}
