import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { DeleteMediaUseCase } from "@/usecases/media/delete-media";
import { StorageProvider } from "@/providers/storage/interface";
import { NotFoundError, ForbiddenError, ExternalServiceError } from "@/errors";

describe("DeleteMediaUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let storageMock: DeepMockProxy<StorageProvider>;
  let useCase: DeleteMediaUseCase;

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

  const media = {
    id: "m-1",
    websiteId: "ws-1",
    type: "PHOTO" as const,
    url: "https://cdn/photo.jpg",
    key: "websites/ws-1/photo.jpg",
    fileName: "photo.jpg",
    sizeBytes: 1024,
    mimeType: "image/jpeg",
    sortOrder: 0,
    caption: null,
    createdAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    storageMock = mockDeep<StorageProvider>();
    mockReset(prismaMock);
    mockReset(storageMock);
    useCase = new DeleteMediaUseCase(prismaMock, storageMock);
  });

  it("should soft-delete the media record in DB before deleting from storage", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findUnique.mockResolvedValue(media);
    prismaMock.media.update.mockResolvedValue({
      ...media,
      deletedAt: new Date(),
    });
    storageMock.deleteObject.mockResolvedValue(undefined);

    await useCase.execute("ws-1", "m-1", "user-1");

    expect(prismaMock.media.update).toHaveBeenCalledWith({
      where: { id: "m-1" },
      data: { deletedAt: expect.any(Date) },
    });
    expect(storageMock.deleteObject).toHaveBeenCalledWith(
      "websites/ws-1/photo.jpg",
    );
  });

  it("should call DB update before storage delete (safe ordering)", async () => {
    const callOrder: string[] = [];
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findUnique.mockResolvedValue(media);
    prismaMock.media.update.mockImplementation(async () => {
      callOrder.push("db");
      return { ...media, deletedAt: new Date() };
    });
    storageMock.deleteObject.mockImplementation(async () => {
      callOrder.push("storage");
    });

    await useCase.execute("ws-1", "m-1", "user-1");

    expect(callOrder).toEqual(["db", "storage"]);
  });

  it("should revert DB soft-delete and rethrow when R2 delete fails", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findUnique.mockResolvedValue(media);
    prismaMock.media.update
      .mockResolvedValueOnce({ ...media, deletedAt: new Date() })
      .mockResolvedValueOnce({ ...media, deletedAt: null });
    const storageError = new ExternalServiceError("R2 unavailable");
    storageMock.deleteObject.mockRejectedValue(storageError);

    await expect(useCase.execute("ws-1", "m-1", "user-1")).rejects.toThrow(
      storageError,
    );

    // First call: soft-delete; second call: revert
    expect(prismaMock.media.update).toHaveBeenCalledTimes(2);
    expect(prismaMock.media.update).toHaveBeenNthCalledWith(2, {
      where: { id: "m-1" },
      data: { deletedAt: null },
    });
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(useCase.execute("ws-1", "m-1", "user-1")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(useCase.execute("ws-1", "m-1", "other-user")).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("should throw NotFoundError when media does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findUnique.mockResolvedValue(null);

    await expect(useCase.execute("ws-1", "m-1", "user-1")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("should throw NotFoundError when media belongs to a different website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findUnique.mockResolvedValue({
      ...media,
      websiteId: "ws-other",
    });

    await expect(useCase.execute("ws-1", "m-1", "user-1")).rejects.toThrow(
      NotFoundError,
    );
  });
});
