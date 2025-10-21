import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { authMiddleware } from "../../../middleware/auth";
import { currentUserRoute } from "@repo/api-spec/modules/auth/routes";

const me = new OpenAPIHono().openapi(
  {
    ...currentUserRoute,
    middleware: [authMiddleware] as const,
  },
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
