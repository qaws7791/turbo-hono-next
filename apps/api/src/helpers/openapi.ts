import { Context } from "@/types/hono.types";
import { OpenAPIHono } from "@hono/zod-openapi";

export const createOpenAPI = () => {
  return new OpenAPIHono<Context>();
};
