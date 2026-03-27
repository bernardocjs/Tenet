import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { CreateWebsiteUseCase } from "@/usecases/websites/create-website";

vi.mock("@/utils/slug", () => ({
  generateSlug: vi.fn().mockReturnValue("john-e-jane-abc123"),
}));

describe("CreateWebsiteUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: CreateWebsiteUseCase;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new CreateWebsiteUseCase(prismaMock);
  });

  it("should create a website with generated slug", async () => {
    const created = {
      id: "ws-1",
      userId: "user-1",
      slug: "john-e-jane-abc123",
      title: "Our Love",
      partnerName1: "John",
      partnerName2: "Jane",
      anniversaryDate: null,
      message: null,
      theme: "classic",
      status: "DRAFT" as const,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    prismaMock.coupleWebsite.create.mockResolvedValue(created);

    const result = await useCase.execute("user-1", {
      title: "Our Love",
      partnerName1: "John",
      partnerName2: "Jane",
      theme: "classic",
    });

    expect(result.slug).toBe("john-e-jane-abc123");
    expect(result.status).toBe("DRAFT");
    expect(prismaMock.coupleWebsite.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        slug: "john-e-jane-abc123",
        title: "Our Love",
      }),
    });
  });
});
