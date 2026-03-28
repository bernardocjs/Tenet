import { PrismaClient } from "@prisma/client";

// Models that support soft delete via the deletedAt field
const SOFT_DELETE_MODELS = new Set(["CoupleWebsite", "Media", "User"]);

const SOFT_DELETE_ACTIONS = new Set(["findMany", "findFirst", "findUnique"]);

function makePrismaClient(): PrismaClient {
  const client = new PrismaClient();

  client.$use(async (params, next) => {
    if (
      SOFT_DELETE_ACTIONS.has(params.action) &&
      SOFT_DELETE_MODELS.has(params.model ?? "")
    ) {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};
      if (!("deletedAt" in params.args.where)) {
        params.args.where.deletedAt = null;
      }
    }
    return next(params);
  });

  return client;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
