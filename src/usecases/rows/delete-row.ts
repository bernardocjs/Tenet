import { PrismaClient } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "@/errors";

export class DeleteRowUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(websiteId: string, userId: string, rowId: string): Promise<void> {
    const row = await this.db.mediaRow.findUnique({
      where: { id: rowId, deletedAt: null },
    });

    if (!row || row.websiteId !== websiteId) {
      throw new NotFoundError(`Row ${rowId} not found`);
    }

    const website = await this.db.coupleWebsite.findUnique({
      where: { id: websiteId, deletedAt: null },
    });

    if (!website || website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    await this.db.mediaRow.update({
      where: { id: rowId },
      data: { deletedAt: new Date() },
    });
  }
}
