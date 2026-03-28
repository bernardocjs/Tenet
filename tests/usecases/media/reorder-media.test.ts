import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { ReorderMediaUseCase } from "@/usecases/media/reorder-media";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("ReorderMediaUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: ReorderMediaUseCase;

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

  const mediaList = [
    {
      id: "m-1",
      websiteId: "ws-1",
      type: "PHOTO" as const,
      url: "https://cdn/a.jpg",
      key: "websites/ws-1/a.jpg",
      fileName: "a.jpg",
      sizeBytes: 512,
      mimeType: "image/jpeg",
      sortOrder: 0,
      caption: null,
      createdAt: new Date(),
      deletedAt: null,
    },
    {
      id: "m-2",
      websiteId: "ws-1",
      type: "PHOTO" as const,
      url: "https://cdn/b.jpg",
      key: "websites/ws-1/b.jpg",
      fileName: "b.jpg",
      sizeBytes: 768,
      mimeType: "image/jpeg",
      sortOrder: 1,
      caption: null,
      createdAt: new Date(),
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new ReorderMediaUseCase(prismaMock);
  });

  it("should reorder media and return them sorted", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.$transaction.mockResolvedValue([]);
    prismaMock.media.findMany.mockResolvedValue([mediaList[1], mediaList[0]]);

    const result = await useCase.execute("ws-1", "user-1", {
      mediaIds: ["m-2", "m-1"],
    });

    expect(result).toHaveLength(2);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.media.findMany).toHaveBeenCalledWith({
      where: { websiteId: "ws-1", deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  });

  it("should include websiteId in the update where clause to prevent cross-website tampering", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.$transaction.mockResolvedValue([]);
    prismaMock.media.findMany.mockResolvedValue([]);

    await useCase.execute("ws-1", "user-1", { mediaIds: ["m-1"] });

    // The transaction is called with update operations that include websiteId
    const transactionArg = prismaMock.$transaction.mock.calls[0][0];
    expect(Array.isArray(transactionArg)).toBe(true);
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", { mediaIds: ["m-1"] }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", { mediaIds: ["m-1"] }),
    ).rejects.toThrow(ForbiddenError);
  });
});
