import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

export const logger = pino(
  process.env.NODE_ENV !== "production"
    ? {
        level,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : { level },
);
