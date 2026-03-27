import { PrismaClient, CoupleWebsite } from "@prisma/client";
import { CreateWebsiteInput } from "@/dtos/website-dtos";
import { generateSlug } from "@/utils/slug";

export class CreateWebsiteUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(
    userId: string,
    input: CreateWebsiteInput,
  ): Promise<CoupleWebsite> {
    const slug = generateSlug(input.partnerName1, input.partnerName2);

    return this.db.coupleWebsite.create({
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
  }
}
