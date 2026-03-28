import { PrismaClient, CoupleWebsite } from "@prisma/client";
import { CreateWebsiteInput } from "@/dtos/website-dtos";
import { generateSlug } from "@/utils/slug";
import { mapPrismaError } from "@/lib/prisma-errors";

export class CreateWebsiteUseCase {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Creates a new couple website for the given user.
   * @param userId - The ID of the authenticated user
   * @param input - The data to create the website
   * @returns The created CoupleWebsite record
   * @throws BadRequestError if a website with the generated slug already exists
   */
  async execute(
    userId: string,
    input: CreateWebsiteInput,
  ): Promise<CoupleWebsite> {
    const slug = generateSlug(input.partnerName1, input.partnerName2);

    try {
      return await this.db.coupleWebsite.create({
        data: {
          userId,
          slug,
          title: input.title,
          partnerName1: input.partnerName1,
          partnerName2: input.partnerName2,
          anniversaryDate: input.anniversaryDate ?? null,
          message: input.message ?? null,
          theme: input.theme,
        },
      });
    } catch (err) {
      return mapPrismaError(err);
    }
  }
}
