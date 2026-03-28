import { PrismaClient } from "@prisma/client";
import { StorageProvider } from "@/providers/storage/interface";
import { NotFoundError, ForbiddenError } from "@/errors";

export class DeleteMediaUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: StorageProvider,
  ) {}

  /**
   * Deletes a media record from both the database and storage.
   * Soft-deletes the DB record first, then attempts to delete from R2.
   * If the R2 delete fails, the DB soft-delete is reverted (compensation) before re-throwing.
   * @param websiteId - The ID of the website that owns the media
   * @param mediaId - The ID of the media to delete
   * @param userId - The ID of the authenticated user (must own the website)
   * @throws NotFoundError if the website or media record does not exist
   * @throws ForbiddenError if the user does not own the website
   * @throws ExternalServiceError if the R2 deletion fails (DB change is reverted)
   */
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

    const deletedAt = new Date();

    await this.db.media.update({
      where: { id: mediaId },
      data: { deletedAt },
    });
    try {
      await this.storage.deleteObject(media.key);
    } catch (err) {
      await this.db.media.update({
        where: { id: mediaId },
        data: { deletedAt: null },
      });
      throw err;
    }
  }
}
