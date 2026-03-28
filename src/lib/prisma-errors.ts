import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { BadRequestError, NotFoundError } from "@/errors";

/**
 * Maps a known Prisma error to an AppError subclass.
 * If the error is not a recognized Prisma error, it is re-thrown as-is.
 * @param err - The error caught from a Prisma operation
 * @throws BadRequestError for unique constraint violations (P2002)
 * @throws BadRequestError for foreign key constraint violations (P2003)
 * @throws NotFoundError for record-not-found errors on update/delete (P2025)
 * @throws the original error if it is not a recognized Prisma error
 */
export function mapPrismaError(err: unknown): never {
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      throw new BadRequestError("A record with the same unique field already exists");
    }
    if (err.code === "P2025") {
      throw new NotFoundError("Record not found");
    }
    if (err.code === "P2003") {
      throw new BadRequestError("Operation violates a foreign key constraint");
    }
  }
  throw err;
}
