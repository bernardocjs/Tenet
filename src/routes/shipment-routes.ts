import { Router } from "express";
import {
  createShipment,
  getShipmentById,
  updateShipmentStatus,
} from "@/controllers/shipment-controller";

export function createShipmentRoutes(): Router {
  const router = Router();

  router.post("/", createShipment);
  router.get("/:id", getShipmentById);
  router.patch("/:id/status", updateShipmentStatus);

  return router;
}
