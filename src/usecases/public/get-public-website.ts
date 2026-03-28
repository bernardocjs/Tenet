import { PrismaClient, WebsiteStatus } from "@prisma/client";
import { NotFoundError } from "@/errors";

interface PublicWebsite {
  slug: string;
  title: string;
  partnerName1: string;
  partnerName2: string;
  anniversaryDate: Date | null;
  message: string | null;
  theme: string;
  publishedAt: Date | null;
  media: {
    id: string;
    type: string;
    url: string;
    caption: string | null;
    sortOrder: number;
  }[];
}

export class GetPublicWebsiteUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(slug: string): Promise<PublicWebsite> {
    const website = await this.db.coupleWebsite.findUnique({
      where: { slug, deletedAt: null, status: WebsiteStatus.PUBLISHED },
      include: {
        media: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            type: true,
            url: true,
            caption: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!website) {
      throw new NotFoundError("Website not found");
    }

    return {
      slug: website.slug,
      title: website.title,
      partnerName1: website.partnerName1,
      partnerName2: website.partnerName2,
      anniversaryDate: website.anniversaryDate,
      message: website.message,
      theme: website.theme,
      publishedAt: website.publishedAt,
      media: website.media,
    };
  }
}
