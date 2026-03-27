import { PrismaClient, Media } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";
import { ReorderMediaInput } from "@/dtos/media-dtos";

export class ReorderMediaUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(
    websiteId: string,
    userId: string,
    input: ReorderMediaInput,
  ): Promise<Media[]> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${websiteId} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    await this.db.$transaction(
      input.mediaIds.map((mediaId, index) =>
        this.db.media.update({
          where: { id: mediaId },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.db.media.findMany({
      where: { websiteId, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }
}
