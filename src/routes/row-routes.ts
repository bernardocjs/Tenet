import { Router } from "express";
import { createRow, renameRow, deleteRow, listRows } from "@/controllers/row-controller";

export function createRowRoutes(): Router {
  const router = Router();

  router.post("/:id/rows", createRow);
  router.get("/:id/rows", listRows);
  router.patch("/:id/rows/:rowId", renameRow);
  router.delete("/:id/rows/:rowId", deleteRow);

  return router;
}
