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

  it("should return all websites for the user ordered by createdAt desc", async () => {
    const websites = [
      { ...websiteBase, id: "ws-2" },
      { ...websiteBase, id: "ws-1" },
    ];
    prismaMock.coupleWebsite.findMany.mockResolvedValue(websites);

    const result = await useCase.execute("user-1");

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("ws-2");
    expect(prismaMock.coupleWebsite.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should return an empty array when the user has no websites", async () => {
    prismaMock.coupleWebsite.findMany.mockResolvedValue([]);

    const result = await useCase.execute("user-1");

    expect(result).toEqual([]);
  });
});
