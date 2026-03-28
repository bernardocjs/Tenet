import { PrismaClient, CoupleWebsite, WebsiteStatus } from "@prisma/client";
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

    if (website.status === WebsiteStatus.PUBLISHED) {
      throw new BadRequestError("Website is already published");
    }

    if (website.status === WebsiteStatus.ARCHIVED) {
      throw new BadRequestError("Cannot publish an archived website");
    }

    const mediaCount = await this.db.media.count({
      where: { websiteId: id },
    });

    if (!website.message && mediaCount === 0) {
      throw new BadRequestError(
        "Website must have a message or at least one media item before publishing",
      );
    }

    return this.db.coupleWebsite.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
}
