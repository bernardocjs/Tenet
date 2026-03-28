import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { ListUserWebsitesUseCase } from "@/usecases/websites/list-user-websites";

describe("ListUserWebsitesUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: ListUserWebsitesUseCase;

  const websiteBase = {
    userId: "user-1",
    slug: "test-slug",
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

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new ListUserWebsitesUseCase(prismaMock);
  });

  it("should return paginated websites for the user ordered by createdAt desc", async () => {
    const websites = [
      { ...websiteBase, id: "ws-2" },
      { ...websiteBase, id: "ws-1" },
    ];
    prismaMock.coupleWebsite.findMany.mockResolvedValue(websites);
    prismaMock.coupleWebsite.count.mockResolvedValue(2);

    const result = await useCase.execute("user-1", 1, 20);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe("ws-2");
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 2 });
    expect(prismaMock.coupleWebsite.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 20,
    });
  });

  it("should return empty data when the user has no websites", async () => {
    prismaMock.coupleWebsite.findMany.mockResolvedValue([]);
    prismaMock.coupleWebsite.count.mockResolvedValue(0);

    const result = await useCase.execute("user-1", 1, 20);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it("should calculate correct skip for page 2", async () => {
    prismaMock.coupleWebsite.findMany.mockResolvedValue([]);
    prismaMock.coupleWebsite.count.mockResolvedValue(25);

    await useCase.execute("user-1", 2, 10);

    expect(prismaMock.coupleWebsite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });
});
