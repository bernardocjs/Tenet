import { Request } from "express";
import { UnauthorizedError } from "@/errors";
import { logger } from "@/utils/logger";

/**
 * Extracts the authenticated user ID from the request object.
 * @param req - The Express request object, expected to have `userId` set by auth middleware.
 * @returns The authenticated user's ID string.
 * @throws {UnauthorizedError} When `req.userId` is not present (unauthenticated request).
 */
export function requireUserId(req: Request): string {
  if (!req.userId) {
    logger.warn({ path: req.path }, "Unauthorized: missing userId");
    throw new UnauthorizedError();
  }
  return req.userId;
}
