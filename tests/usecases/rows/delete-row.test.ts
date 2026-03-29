import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { DeleteRowUseCase } from "@/usecases/rows/delete-row";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("DeleteRowUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: DeleteRowUseCase;

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
    useCase = new DeleteRowUseCase(prismaMock);
  });

  it("should soft-delete the row and leave media unaffected", async () => {
    prismaMock.mediaRow.findUnique.mockResolvedValue(row);
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.mediaRow.update.mockResolvedValue({ ...row, deletedAt: new Date() });

    await useCase.execute("ws-1", "user-1", "row-1");

    expect(prismaMock.mediaRow.update).toHaveBeenCalledWith({
      where: { id: "row-1" },
      data: { deletedAt: expect.any(Date) },
    });
    // Media model should NOT be touched
    expect(prismaMock.media.update).not.toHaveBeenCalled();
    expect(prismaMock.media.delete).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when row does not exist", async () => {
    prismaMock.mediaRow.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", "row-1"),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.mediaRow.findUnique.mockResolvedValue(row);
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", "row-1"),
    ).rejects.toThrow(ForbiddenError);
  });
});
