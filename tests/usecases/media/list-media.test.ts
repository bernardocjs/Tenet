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

  it("should return media ordered by sortOrder ascending", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findMany.mockResolvedValue([mediaBase]);

    const result = await useCase.execute("ws-1", "user-1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("m-1");
    expect(prismaMock.media.findMany).toHaveBeenCalledWith({
      where: { websiteId: "ws-1", deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  });

  it("should return an empty array when website has no media", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findMany.mockResolvedValue([]);

    const result = await useCase.execute("ws-1", "user-1");

    expect(result).toEqual([]);
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(useCase.execute("ws-1", "user-1")).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(useCase.execute("ws-1", "other-user")).rejects.toThrow(ForbiddenError);
  });
});
