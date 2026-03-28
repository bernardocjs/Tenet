import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { UpdateWebsiteUseCase } from "@/usecases/websites/update-website";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("UpdateWebsiteUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: UpdateWebsiteUseCase;

  const website = {
    id: "ws-1",
    userId: "user-1",
    slug: "test-slug",
    title: "Old Title",
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
    useCase = new UpdateWebsiteUseCase(prismaMock);
  });

  it("should update and return the website", async () => {
    const updated = { ...website, title: "New Title" };
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.coupleWebsite.update.mockResolvedValue(updated);

    const result = await useCase.execute("ws-1", "user-1", { title: "New Title" });

    expect(result.title).toBe("New Title");
    expect(prismaMock.coupleWebsite.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: { title: "New Title" },
    });
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", { title: "X" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", { title: "X" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
