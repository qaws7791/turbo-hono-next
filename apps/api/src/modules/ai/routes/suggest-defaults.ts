import { OpenAPIHono } from "@hono/zod-openapi";
import { getPlanRecommendationsRoute as getPlanRecommendationsRouteSpec } from "@repo/api-spec/modules/ai/routes";
import status from "http-status";

import { generateDefaultsSuggestion } from "../../../external/ai/features/defaults-suggestion/generator";
import { authMiddleware } from "../../../middleware/auth";
import { AuthErrors } from "../../auth/errors";
import { documentService } from "../../documents/services/document.service";
import { AIErrors } from "../errors";

import type { AuthContext } from "../../../middleware/auth";

const getPlanRecommendationsRoute = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getPlanRecommendationsRouteSpec,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const body = c.req.valid("json");
      const auth = c.get("auth");

      if (!auth?.user?.id) {
        throw AuthErrors.unauthorized();
      }

      const { learningTopic, mainGoal, documentId } = body;

      // Get document via service if documentId is provided
      let document = null;
      if (documentId) {
        try {
          document = await documentService.getDocumentDetail({
            publicId: documentId,
            userId: auth.user.id,
          });
        } catch {
          throw AIErrors.documentNotFound();
        }
      }

      // Fetch PDF from storage if document exists
      const pdfContents: ArrayBuffer | null = document
        ? await fetch(document.storageUrl).then((res) => res.arrayBuffer())
        : null;

      // Generate smart defaults using AI
      const suggestedDefaults = await generateDefaultsSuggestion({
        promptData: {
          learningTopic,
          mainGoal,
          includePdfContents: pdfContents !== null,
        },
        pdfContents,
      });

      // Return the suggested defaults
      return c.json(
        {
          userLevel: suggestedDefaults.userLevel,
          targetWeeks: suggestedDefaults.targetWeeks,
          weeklyHours: suggestedDefaults.weeklyHours,
          learningStyle: suggestedDefaults.learningStyle,
          preferredResources: suggestedDefaults.preferredResources,
          reasoning: suggestedDefaults.reasoning,
        },
        status.OK,
      );
    } catch (error) {
      // Handle known AI errors
      if (error instanceof AIErrors.generationFailed().constructor) {
        throw error;
      }

      // Handle AI SDK specific errors
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = error.message as string;

        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("rate limit")
        ) {
          throw AIErrors.apiLimitExceeded();
        }

        if (
          errorMessage.includes("model") ||
          errorMessage.includes("unavailable")
        ) {
          throw AIErrors.apiUnavailable();
        }

        if (
          errorMessage.includes("parsing") ||
          errorMessage.includes("schema")
        ) {
          throw AIErrors.generationFailed({
            message: "Failed to parse AI response for defaults suggestion",
          });
        }
      }

      console.error("AI plan recommendations error:", error);
      throw AIErrors.generationFailed({
        message:
          "Failed to generate plan recommendations due to internal error",
      });
    }
  },
);

export default getPlanRecommendationsRoute;
