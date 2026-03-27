import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { GetPublicWebsiteUseCase } from "@/usecases/public/get-public-website";
import { NotFoundError } from "@/errors";

describe("GetPublicWebsiteUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: GetPublicWebsiteUseCase;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new GetPublicWebsiteUseCase(prismaMock);
  });

  it("should return published website with media", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue({
      id: "ws-1",
      userId: "user-1",
      slug: "john-e-jane",
      title: "Our Love",
      partnerName1: "John",
      partnerName2: "Jane",
      anniversaryDate: null,
      message: "We love each other",
      theme: "classic",
      status: "PUBLISHED",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      media: [
        { id: "m-1", type: "PHOTO", url: "https://cdn/photo.jpg", caption: null, sortOrder: 0 },
      ],
    } as never);

    const result = await useCase.execute("john-e-jane");
    expect(result.slug).toBe("john-e-jane");
    expect(result.media).toHaveLength(1);
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);
    await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundError);
  });

  it("should throw NotFoundError when website is not published", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue({
      id: "ws-1",
      userId: "user-1",
      slug: "test",
      title: "T",
      partnerName1: "A",
      partnerName2: "B",
      anniversaryDate: null,
      message: null,
      theme: "classic",
      status: "DRAFT",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      media: [],
    } as never);

    await expect(useCase.execute("test")).rejects.toThrow(NotFoundError);
  });
});
