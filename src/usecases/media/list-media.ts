import { PrismaClient, Media } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";

export class ListMediaUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(websiteId: string, userId: string): Promise<Media[]> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${websiteId} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    return this.db.media.findMany({
      where: { websiteId, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }
}
