import { PrismaClient, CoupleWebsite } from "@prisma/client";

interface PaginatedWebsites {
  data: CoupleWebsite[];
  meta: { page: number; limit: number; total: number };
}

export class ListUserWebsitesUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(userId: string, page: number, limit: number): Promise<PaginatedWebsites> {
    const where = { userId, deletedAt: null };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.db.coupleWebsite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.db.coupleWebsite.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }
}
