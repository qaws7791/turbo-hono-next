import { HTTPError } from "@/common/errors/http-error";
import { Context } from "@/common/types/hono.types";
import { roleHierarchy } from "@/domain/user/user.constants";
import { type UserRole } from "@/infrastructure/database/types";
import { createMiddleware } from "hono/factory";
import status from "http-status";

export const roleMiddleware = (requiredRole: UserRole) => {
  return createMiddleware<Context>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPError(
        {
          message: "Unauthorized",
        },
        status.UNAUTHORIZED,
      );
    }

    const hasRequiredRole =
      roleHierarchy[user.role] >= roleHierarchy[requiredRole];

    if (!hasRequiredRole) {
      throw new HTTPError(
        {
          message: "Unauthorized",
        },
        status.UNAUTHORIZED,
      );
    }

    await next();
  });
};

/**
 * 유저 권한 검사 미들웨어
 */
export const isUser = roleMiddleware("user");

/**
 * 크리에이터 권한 검사 미들웨어
 */
export const isCreator = roleMiddleware("creator");
