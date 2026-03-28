import { Router } from "express";
import { register, login } from "@/controllers/auth-controller";
import { createRateLimiter } from "@/middlewares/rate-limit";

export function createAuthRoutes(): Router {
  const router = Router();

  router.post("/register", createRateLimiter(5), register);
  router.post("/login", createRateLimiter(10), login);

  return router;
}
