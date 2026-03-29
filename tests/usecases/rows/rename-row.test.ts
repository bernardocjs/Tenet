import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { RenameRowUseCase } from "@/usecases/rows/rename-row";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("RenameRowUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: RenameRowUseCase;

  const row = {
    id: "row-1",
    websiteId: "ws-1",
    name: "Our Trips",
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

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
    useCase = new RenameRowUseCase(prismaMock);
  });

  it("should rename a row successfully", async () => {
    prismaMock.mediaRow.findUnique.mockResolvedValue(row);
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.mediaRow.update.mockResolvedValue({ ...row, name: "Vacations" });

    const result = await useCase.execute("ws-1", "user-1", "row-1", { name: "Vacations" });

    expect(result.name).toBe("Vacations");
    expect(prismaMock.mediaRow.update).toHaveBeenCalledWith({
      where: { id: "row-1" },
      data: { name: "Vacations" },
    });
  });

  it("should throw NotFoundError when row does not exist", async () => {
    prismaMock.mediaRow.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", "row-1", { name: "Vacations" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.mediaRow.findUnique.mockResolvedValue(row);
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", "row-1", { name: "Vacations" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
