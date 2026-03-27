import { PrismaClient } from "@prisma/client";
import { StorageProvider } from "@/providers/storage/interface";
import { NotFoundError, ForbiddenError } from "@/errors";

export class DeleteMediaUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: StorageProvider,
  ) {}

  async execute(
    websiteId: string,
    mediaId: string,
    userId: string,
  ): Promise<void> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${websiteId} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    const media = await this.db.media.findUnique({
      where: { id: mediaId, deletedAt: null },
    });

    if (!media || media.websiteId !== websiteId) {
      throw new NotFoundError(`Media ${mediaId} not found`);
    }

    await this.storage.deleteObject(media.key);

    await this.db.media.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });
  }
}
