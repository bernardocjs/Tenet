import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { ListMediaUseCase } from "@/usecases/media/list-media";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("ListMediaUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: ListMediaUseCase;

  const website = {
    id: "ws-1",
    userId: "user-1",
    slug: "test",
    title: "T",
    partnerName1: "A",
    partnerName2: "B",
    anniversaryDate: null,
    message: null,
    theme: "classic",
    status: "DRAFT" as const,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mediaBase = {
    id: "m-1",
    websiteId: "ws-1",
    type: "PHOTO" as const,
    url: "https://cdn/photo.jpg",
    key: "websites/ws-1/photo.jpg",
    fileName: "photo.jpg",
    sizeBytes: 1024,
    mimeType: "image/jpeg",
    sortOrder: 0,
    caption: null,
    createdAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new ListMediaUseCase(prismaMock);
  });

  it("should return paginated media ordered by sortOrder ascending", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findMany.mockResolvedValue([mediaBase]);
    prismaMock.media.count.mockResolvedValue(1);

    const result = await useCase.execute("ws-1", "user-1", 1, 50);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("m-1");
    expect(result.meta).toEqual({ page: 1, limit: 50, total: 1 });
    expect(prismaMock.media.findMany).toHaveBeenCalledWith({
      where: { websiteId: "ws-1", deletedAt: null },
      orderBy: { sortOrder: "asc" },
      skip: 0,
      take: 50,
    });
  });

  it("should return empty data when website has no media", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findMany.mockResolvedValue([]);
    prismaMock.media.count.mockResolvedValue(0);

    const result = await useCase.execute("ws-1", "user-1", 1, 50);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(useCase.execute("ws-1", "user-1", 1, 50)).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(useCase.execute("ws-1", "other-user", 1, 50)).rejects.toThrow(ForbiddenError);
  });
});
