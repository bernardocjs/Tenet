import { Router } from "express";
import { register, login } from "@/controllers/auth-controller";

export function createAuthRoutes(): Router {
  const router = Router();

  router.post("/register", register);
  router.post("/login", login);

  return router;
}
