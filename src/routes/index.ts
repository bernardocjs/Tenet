import { Router } from "express";
import { createShipmentRoutes } from "./shipment-routes";

export function registerRoutes(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  router.use("/shipments", createShipmentRoutes());

  return router;
}
