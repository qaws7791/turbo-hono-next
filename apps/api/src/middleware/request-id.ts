import { createMiddleware } from "hono/factory";

export type RequestIdVariables = {
  requestId: string;
};

export const requestIdMiddleware = createMiddleware<{
  Variables: RequestIdVariables;
}>(async (c, next) => {
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  await next();
});
