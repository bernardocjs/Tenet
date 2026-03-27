import { PrismaClient, CoupleWebsite } from "@prisma/client";
import { UpdateWebsiteInput } from "@/dtos/website-dtos";
import { NotFoundError, ForbiddenError } from "@/errors";

export class UpdateWebsiteUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(
    id: string,
    userId: string,
    input: UpdateWebsiteInput,
  ): Promise<CoupleWebsite> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { id, deletedAt: null },
    });

    if (!website) {
      throw new NotFoundError(`Website ${id} not found`);
    }

    if (website.userId !== userId) {
      throw new ForbiddenError("You do not own this website");
    }

    return this.db.coupleWebsite.update({
      where: { id },
      data: input,
    });
  }
}
