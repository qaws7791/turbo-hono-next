import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { changePasswordRoute } from "@repo/api-spec/modules/auth/routes";

import { authService } from "../services/auth.service";
import { AuthErrors } from "../errors";
import { authMiddleware } from "../../../middleware/auth";

import type { ChangePasswordRequest } from "../schema";

const changePassword = new OpenAPIHono<{
  Variables: {
    user: {
      id: string;
      email: string;
    };
  };
}>().openapi(
  {
    ...changePasswordRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        throw AuthErrors.unauthorized();
      }

      const { currentPassword, newPassword }: ChangePasswordRequest =
        c.req.valid("json");

      // Call auth service to change password
      const result = await authService.changePassword({
        userId: user.id,
        currentPassword,
        newPassword,
      });

      return c.json(result, status.OK);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      console.error("Change password error:", error);
      throw AuthErrors.forbidden({
        message: "Internal server error",
      });
    }
  },
);

export default changePassword;
