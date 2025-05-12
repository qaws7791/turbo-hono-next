import { roleHierarchy } from "@/constants/users.constants";
import { type UserRole } from "@/db/types";
import { Context } from "@/types/hono.types";
import { createMiddleware } from "hono/factory";

export const roleMiddleware = (requiredRole: UserRole) => {
  return createMiddleware<Context>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const hasRequiredRole =
      roleHierarchy[user.role] >= roleHierarchy[requiredRole];

    if (!hasRequiredRole) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    next();
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
