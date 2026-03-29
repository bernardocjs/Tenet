import { PrismaClient, MediaRow, MediaRowItem, Media } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";

export type RowWithItems = MediaRow & {
  items: (MediaRowItem & { media: Media })[];
};

export class ListRowsUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(websiteId: string, userId: string): Promise<RowWithItems[]> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) throw new NotFoundError(`Website ${websiteId} not found`);
    if (website.userId !== userId) throw new ForbiddenError("You do not own this website");

    return this.db.mediaRow.findMany({
      where: { websiteId, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { media: true },
        },
      },
    }) as Promise<RowWithItems[]>;
  }
}
