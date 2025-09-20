import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { authMiddleware } from "../../../middleware/auth";
import { AuthModel } from "../schema";

const me = new OpenAPIHono().openapi(
  createRoute({
    tags: ["Auth"],
    method: "get",
    path: "/auth/me",
    summary: "Get current user information",
    middleware: [authMiddleware] as const,
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: AuthModel.UserResponseSchema,
          },
        },
        description: "Current user information",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Authentication required",
      },
    },
  }),
  async (c) => {
    const auth = c.get("auth");

    return c.json(
      {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        emailVerified: !!auth.user.emailVerified,
        image: auth.user.image,
      },
      status.OK,
    );
  },
);

export default me;
