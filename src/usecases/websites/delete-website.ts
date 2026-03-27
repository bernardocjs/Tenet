import { PrismaClient } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";

export class DeleteWebsiteUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(id: string, userId: string): Promise<void> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${id} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    await this.db.coupleWebsite.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
