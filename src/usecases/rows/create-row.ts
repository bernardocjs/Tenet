import { PrismaClient, MediaRow } from "@prisma/client";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";

export interface CreateRowInput {
  name: string;
}

const MAX_ROWS = 10;

export class CreateRowUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(websiteId: string, userId: string, input: CreateRowInput): Promise<MediaRow> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website) throw new NotFoundError(`Website ${websiteId} not found`);
    if (website.userId !== userId) throw new ForbiddenError("You do not own this website");

    const rowCount = await this.db.mediaRow.count({
      where: { websiteId, deletedAt: null },
    });

    if (rowCount >= MAX_ROWS) {
      throw new BadRequestError(`Website cannot have more than ${MAX_ROWS} rows`);
    }

    const lastRow = await this.db.mediaRow.findFirst({
      where: { websiteId, deletedAt: null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const sortOrder = (lastRow?.sortOrder ?? -1) + 1;

    return this.db.mediaRow.create({
      data: { websiteId, name: input.name, sortOrder },
    });
  }
}
