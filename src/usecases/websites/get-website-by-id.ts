import { PrismaClient, CoupleWebsite } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";

export class GetWebsiteByIdUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(id: string, userId: string): Promise<CoupleWebsite> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${id} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    return website;
  }
}
