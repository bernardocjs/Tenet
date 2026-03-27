import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { PublishWebsiteUseCase } from "@/usecases/websites/publish-website";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";

describe("PublishWebsiteUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: PublishWebsiteUseCase;

  const draftWebsite = {
    id: "ws-1",
    userId: "user-1",
    slug: "test-slug",
    title: "Our Love",
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
    useCase = new PublishWebsiteUseCase(prismaMock);
  });

  it("should publish a draft website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(draftWebsite);
    prismaMock.coupleWebsite.update.mockResolvedValue({
      ...draftWebsite,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const result = await useCase.execute("ws-1", "user-1");
    expect(result.status).toBe("PUBLISHED");
    expect(result.publishedAt).toBeTruthy();
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(useCase.execute("ws-1", "user-1")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(draftWebsite);

    await expect(useCase.execute("ws-1", "other-user")).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("should throw BadRequestError when website is already published", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue({
      ...draftWebsite,
      status: "PUBLISHED",
    });

    await expect(useCase.execute("ws-1", "user-1")).rejects.toThrow(
      BadRequestError,
    );
  });

  it("should throw BadRequestError when website is archived", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue({
      ...draftWebsite,
      status: "ARCHIVED",
    });

    await expect(useCase.execute("ws-1", "user-1")).rejects.toThrow(
      BadRequestError,
    );
  });
});
