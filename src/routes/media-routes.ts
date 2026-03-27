import { Router } from "express";
import {
  generateUploadUrl,
  confirmUpload,
  listMedia,
  reorderMedia,
  deleteMedia,
} from "@/controllers/media-controller";

export function createMediaRoutes(): Router {
  const router = Router();

  router.post("/:id/media/upload-url", generateUploadUrl);
  router.post("/:id/media/confirm", confirmUpload);
  router.get("/:id/media", listMedia);
  router.patch("/:id/media/reorder", reorderMedia);
  router.delete("/:id/media/:mediaId", deleteMedia);

  return router;
}
