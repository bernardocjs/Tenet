import { PrismaClient } from "@prisma/client";
import { StorageProvider, PresignedUrlResult } from "@/providers/storage/interface";
import { NotFoundError, ForbiddenError } from "@/errors";
import { UploadUrlInput } from "@/dtos/media-dtos";

export class GenerateUploadUrlUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: StorageProvider,
  ) {}

  async execute(
    websiteId: string,
    userId: string,
    input: UploadUrlInput,
  ): Promise<PresignedUrlResult> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${websiteId} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    return this.storage.generatePresignedUploadUrl(
      input.fileName,
      input.contentType,
      websiteId,
    );
  }
}
