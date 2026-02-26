import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@/errors";
import { logger } from "@/utils/logger";

interface ErrorResponse {
  status: "error";
  message: string;
  errors?: { field: string; message: string }[];
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  logger.error(err, "Unexpected error");

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
