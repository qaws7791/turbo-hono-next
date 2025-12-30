import pino from "pino";

import { CONFIG } from "./config";

const transport =
  CONFIG.NODE_ENV === "production" || CONFIG.NODE_ENV === "test"
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
          singleLine: false,
          messageFormat: "{msg}",
          errorLikeObjectKeys: ["err", "error"],
        },
      };

export const logger = pino({
  level:
    CONFIG.NODE_ENV === "test"
      ? "silent"
      : CONFIG.NODE_ENV === "production"
        ? "info"
        : "debug",
  transport,
  base: { env: CONFIG.NODE_ENV, service: CONFIG.SERVICE_NAME },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true,
  },
});
