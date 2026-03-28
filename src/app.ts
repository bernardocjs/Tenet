import express, { Application } from "express";
import cors from "cors";
import { config } from "@/config";
import { requestLogger } from "@/middlewares/request-logger";
import { errorHandler } from "@/middlewares/error-handler";
import { registerRoutes } from "@/routes";

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "10kb" }));
  app.use(requestLogger);

  app.use(registerRoutes());
  app.use(errorHandler);

  return app;
}
