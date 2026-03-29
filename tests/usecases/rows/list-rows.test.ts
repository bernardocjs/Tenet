import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { ListRowsUseCase } from "@/usecases/rows/list-rows";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("ListRowsUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: ListRowsUseCase;

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

  const media = {
    id: "m-1",
    websiteId: "ws-1",
    type: "PHOTO" as const,
    url: "https://cdn/a.jpg",
    key: "a.jpg",
    fileName: "a.jpg",
    sizeBytes: 512,
    mimeType: "image/jpeg",
    sortOrder: 0,
    caption: null,
    createdAt: new Date(),
    deletedAt: null,
  };

  const rowsWithItems = [
    {
      id: "row-1",
      websiteId: "ws-1",
      name: "Favorites",
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      items: [
        {
          id: "item-1",
          rowId: "row-1",
          mediaId: "m-1",
          sortOrder: 0,
          createdAt: new Date(),
          media,
        },
      ],
    },
    {
      id: "row-2",
      websiteId: "ws-1",
      name: "Trips",
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      items: [],
    },
  ];

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new ListRowsUseCase(prismaMock);
  });

  it("should return all rows ordered by sortOrder including empty rows, each with their media", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.mediaRow.findMany.mockResolvedValue(rowsWithItems as any);

    const result = await useCase.execute("ws-1", "user-1");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Favorites");
    expect(result[0].items).toHaveLength(1);
    expect(result[1].name).toBe("Trips");
    expect(result[1].items).toHaveLength(0);
    expect(prismaMock.mediaRow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { websiteId: "ws-1", deletedAt: null },
        orderBy: { sortOrder: "asc" },
      }),
    );
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
