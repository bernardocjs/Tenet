import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { DeleteWebsiteUseCase } from "@/usecases/websites/delete-website";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("DeleteWebsiteUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: DeleteWebsiteUseCase;

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

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new DeleteWebsiteUseCase(prismaMock);
  });

  it("should soft delete the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.coupleWebsite.update.mockResolvedValue({
      ...website,
      deletedAt: new Date(),
    });

    await useCase.execute("ws-1", "user-1");

    expect(prismaMock.coupleWebsite.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: { deletedAt: expect.any(Date) },
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
