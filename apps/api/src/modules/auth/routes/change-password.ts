import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { account } from "@repo/database/schema";
import { changePasswordRoute } from "@repo/api-spec/modules/auth/routes";

import { db } from "../../../database/client";
import { passwordUtils } from "../../../utils/password";
import { AuthError } from "../errors";
import { authMiddleware } from "../../../middleware/auth";

import type {ChangePasswordRequest} from "../schema";

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
        throw new AuthError(
          401,
          "auth:authentication_required",
          "Authentication required",
        );
      }

      const { currentPassword, newPassword }: ChangePasswordRequest =
        c.req.valid("json");

      const userAccount = await db
        .select()
        .from(account)
        .where(eq(account.userId, user.id))
        .limit(1);

      if (!userAccount.length || !userAccount[0].password) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "User account not found or no password set",
        );
      }

      const isCurrentPasswordValid = await passwordUtils.verify(
        currentPassword,
        userAccount[0].password,
      );
      if (!isCurrentPasswordValid) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "Current password is incorrect",
        );
      }

      const hashedNewPassword = await passwordUtils.hash(newPassword);

      await db
        .update(account)
        .set({
          password: hashedNewPassword,
          updatedAt: new Date(),
        })
        .where(eq(account.userId, user.id));

      return c.json(
        {
          success: true,
          message: "Password changed successfully",
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error("Change password error:", error);
      throw new AuthError(
        status.INTERNAL_SERVER_ERROR,
        "auth:internal_error",
        "Internal server error",
      );
    }
  },
);

export default changePassword;
