import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { GenerateUploadUrlUseCase } from "@/usecases/media/generate-upload-url";
import { StorageProvider } from "@/providers/storage/interface";
import { NotFoundError, ForbiddenError } from "@/errors";

describe("GenerateUploadUrlUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let storageMock: DeepMockProxy<StorageProvider>;
  let useCase: GenerateUploadUrlUseCase;

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
    storageMock = mockDeep<StorageProvider>();
    mockReset(prismaMock);
    mockReset(storageMock);
    useCase = new GenerateUploadUrlUseCase(prismaMock, storageMock);
  });

  it("should return presigned URL for valid request", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    storageMock.generatePresignedUploadUrl.mockResolvedValue({
      uploadUrl: "https://r2.example.com/presigned",
      key: "websites/ws-1/photo.jpg",
      publicUrl: "https://cdn.example.com/websites/ws-1/photo.jpg",
    });

    const result = await useCase.execute("ws-1", "user-1", {
      fileName: "photo.jpg",
      contentType: "image/jpeg",
    });

    expect(result.uploadUrl).toBe("https://r2.example.com/presigned");
    expect(storageMock.generatePresignedUploadUrl).toHaveBeenCalledWith(
      "photo.jpg",
      "image/jpeg",
      "ws-1",
    );
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", {
        fileName: "photo.jpg",
        contentType: "image/jpeg",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", {
        fileName: "photo.jpg",
        contentType: "image/jpeg",
      }),
    ).rejects.toThrow(ForbiddenError);
  });
});
