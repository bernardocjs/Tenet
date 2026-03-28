import { PrismaClient, Media } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";

interface PaginatedMedia {
  data: Media[];
  meta: { page: number; limit: number; total: number };
}

export class ListMediaUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(websiteId: string, userId: string, page: number, limit: number): Promise<PaginatedMedia> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${websiteId} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    const where = { websiteId, deletedAt: null };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.db.media.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      this.db.media.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }
}
