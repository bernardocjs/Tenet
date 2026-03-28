import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "@/config";
import { UnauthorizedError } from "@/errors";

const JwtPayloadSchema = z.object({
  userId: z.string().min(1),
});

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = header.slice(7);
  try {
    const raw = jwt.verify(token, config.jwtSecret);
    const result = JwtPayloadSchema.safeParse(raw);
    if (!result.success) {
      throw new UnauthorizedError("Invalid token payload");
    }
    req.userId = result.data.userId;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Invalid or expired token");
  }
}
