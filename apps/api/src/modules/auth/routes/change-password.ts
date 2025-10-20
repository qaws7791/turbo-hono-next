import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { account } from "@repo/database/schema";
import { passwordUtils } from "../../../utils/password";
import { AuthError } from "../errors";
import { AuthModel, type ChangePasswordRequest } from "../schema";

const changePassword = new OpenAPIHono<{
  Variables: {
    user: {
      id: string;
      email: string;
    };
  };
}>().openapi(
  createRoute({
    method: "put",
    path: "/auth/change-password",
    tags: ["Auth"],
    summary: "Change user password",
    description:
      "Change the current user's password by providing current and new password",
    request: {
      body: {
        content: {
          "application/json": {
            schema: AuthModel.ChangePasswordRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: AuthModel.SuccessResponseSchema,
          },
        },
        description: "Password changed successfully",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Invalid request data",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Current password is incorrect",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
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
