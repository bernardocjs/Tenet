import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { CreateRowUseCase } from "@/usecases/rows/create-row";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";

describe("CreateRowUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: CreateRowUseCase;

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

  const row = {
    id: "row-1",
    websiteId: "ws-1",
    name: "Our Trips",
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new CreateRowUseCase(prismaMock);
  });

  it("should create a row with sortOrder 0 when no rows exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.mediaRow.count.mockResolvedValue(0);
    prismaMock.mediaRow.findFirst.mockResolvedValue(null);
    prismaMock.mediaRow.create.mockResolvedValue(row);

    const result = await useCase.execute("ws-1", "user-1", { name: "Our Trips" });

    expect(result.name).toBe("Our Trips");
    expect(result.sortOrder).toBe(0);
    expect(prismaMock.mediaRow.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ websiteId: "ws-1", name: "Our Trips", sortOrder: 0 }),
    });
  });

  it("should create a row with sortOrder = max + 1 when rows exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.mediaRow.count.mockResolvedValue(2);
    prismaMock.mediaRow.findFirst.mockResolvedValue({ ...row, sortOrder: 1 });
    prismaMock.mediaRow.create.mockResolvedValue({ ...row, sortOrder: 2 });

    const result = await useCase.execute("ws-1", "user-1", { name: "Our Trips" });

    expect(result.sortOrder).toBe(2);
    expect(prismaMock.mediaRow.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sortOrder: 2 }),
    });
  });

  it("should throw BadRequestError when website already has 10 rows", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.mediaRow.count.mockResolvedValue(10);

    await expect(
      useCase.execute("ws-1", "user-1", { name: "New Row" }),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", { name: "Our Trips" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", { name: "Our Trips" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
