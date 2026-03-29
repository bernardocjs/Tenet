import { Router } from "express";
import { createAuthRoutes } from "./auth-routes";
import { createWebsiteRoutes } from "./website-routes";
import { createMediaRoutes } from "./media-routes";
import { createPublicRoutes } from "./public-routes";
import { createRowRoutes } from "./row-routes";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";

export function registerRoutes(): Router {
  const router = Router();

  router.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", db: "ok" });
    } catch {
      res.status(503).json({ status: "degraded", db: "error" });
    }
  });

  router.use("/auth", createAuthRoutes());
  router.use("/websites", authMiddleware, createWebsiteRoutes());
  router.use("/websites", authMiddleware, createMediaRoutes());
  router.use("/websites", authMiddleware, createRowRoutes());
  router.use("/s", createPublicRoutes());

  return router;
}
