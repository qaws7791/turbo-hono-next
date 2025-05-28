import type { z } from "@hono/zod-openapi";
import { Env } from "hono";

export type ZodSchema = z.AnyZodObject | z.ZodArray<z.AnyZodObject>;

export type UserContext = {
    id: number;
    name: string;
    email: string | null;
    emailVerified: Date | null;
    profileImageUrl: string | null;
    role: "user" | "creator";
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };

export type Context = Env & {
  Variables: {
    user?: UserContext | null;
  };
};

export type AuthContext = Context & {
  Variables: {
    user: UserContext;
  };
};