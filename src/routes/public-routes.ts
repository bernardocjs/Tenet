import { Router } from "express";
import { getPublicWebsite } from "@/controllers/public-controller";

export function createPublicRoutes(): Router {
  const router = Router();

  router.get("/:slug", getPublicWebsite);

  return router;
}
