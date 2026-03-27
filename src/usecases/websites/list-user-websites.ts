import { PrismaClient, CoupleWebsite } from "@prisma/client";

export class ListUserWebsitesUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(userId: string): Promise<CoupleWebsite[]> {
    return this.db.coupleWebsite.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }
}
