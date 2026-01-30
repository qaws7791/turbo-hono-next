import pino from "pino";

import type { Logger } from "pino";
import type { Config } from "./config";

export function createLogger(config: Config): Logger {
  const transport =
    config.NODE_ENV === "production" || config.NODE_ENV === "test"
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

  return pino({
    level:
      config.NODE_ENV === "test"
        ? "silent"
        : config.NODE_ENV === "production"
          ? "info"
          : "debug",
    transport,
    base: { env: config.NODE_ENV, service: config.SERVICE_NAME },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      err: pino.stdSerializers.err,
    },
  });
}
