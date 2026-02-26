import express, { Application } from "express";
import cors from "cors";
import { requestLogger } from "@/middlewares/request-logger";
import { errorHandler } from "@/middlewares/error-handler";
import { registerRoutes } from "@/routes";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use(registerRoutes());
  app.use(errorHandler);

  return app;
}
