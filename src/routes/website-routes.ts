import { Router } from "express";
import {
  createWebsite,
  listWebsites,
  getWebsite,
  updateWebsite,
  deleteWebsite,
  publishWebsite,
} from "@/controllers/website-controller";

export function createWebsiteRoutes(): Router {
  const router = Router();

  router.post("/", createWebsite);
  router.get("/", listWebsites);
  router.get("/:id", getWebsite);
  router.patch("/:id", updateWebsite);
  router.delete("/:id", deleteWebsite);
  router.patch("/:id/publish", publishWebsite);

  return router;
}
