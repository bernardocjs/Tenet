import { PrismaClient, CoupleWebsite } from "@prisma/client";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";

export class PublishWebsiteUseCase {
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

    if (website.status === "PUBLISHED") {
      throw new BadRequestError("Website is already published");
    }

    if (website.status === "ARCHIVED") {
      throw new BadRequestError("Cannot publish an archived website");
    }

    return this.db.coupleWebsite.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
}
