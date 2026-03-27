import { PrismaClient, Media } from "@prisma/client";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";
import { ConfirmUploadInput } from "@/dtos/media-dtos";
import { config } from "@/config";

export class ConfirmUploadUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(
    websiteId: string,
    userId: string,
    input: ConfirmUploadInput,
  ): Promise<Media> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${websiteId} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    const isPhoto = input.mimeType.startsWith("image/");
    const isVideo = input.mimeType.startsWith("video/");

    if (!isPhoto && !isVideo) {
      throw new BadRequestError("File must be an image or video");
    }

    if (isPhoto && input.sizeBytes > config.maxPhotoSizeBytes) {
      throw new BadRequestError("Photo exceeds maximum size of 10MB");
    }

    if (isVideo && input.sizeBytes > config.maxVideoSizeBytes) {
      throw new BadRequestError("Video exceeds maximum size of 100MB");
    }

    const lastMedia = await this.db.media.findFirst({
      where: { websiteId, deletedAt: null },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = (lastMedia?.sortOrder ?? -1) + 1;

    return this.db.media.create({
      data: {
        websiteId,
        type: isPhoto ? "PHOTO" : "VIDEO",
        url: `${config.r2PublicUrl}/${input.key}`,
        key: input.key,
        fileName: input.fileName,
        sizeBytes: input.sizeBytes,
        mimeType: input.mimeType,
        sortOrder,
        caption: input.caption ?? null,
      },
    });
  }
}
