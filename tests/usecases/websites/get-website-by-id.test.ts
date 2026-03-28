import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { GetWebsiteByIdUseCase } from "@/usecases/websites/get-website-by-id";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("GetWebsiteByIdUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: GetWebsiteByIdUseCase;

  const website = {
    id: "ws-1",
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
    useCase = new GetWebsiteByIdUseCase(prismaMock);
  });

  it("should return the website when found and owned by user", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    const result = await useCase.execute("ws-1", "user-1");

    expect(result.id).toBe("ws-1");
    expect(prismaMock.coupleWebsite.findUnique).toHaveBeenCalledWith({
      where: { id: "ws-1", deletedAt: null },
    });
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
