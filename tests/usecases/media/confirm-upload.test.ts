import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { ConfirmUploadUseCase } from "@/usecases/media/confirm-upload";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";

describe("ConfirmUploadUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: ConfirmUploadUseCase;

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

  const mediaBase = {
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
    mockReset(prismaMock);
    useCase = new ConfirmUploadUseCase(prismaMock);
    // Route $transaction callbacks through the same mock so findFirst/create mocks apply
    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prismaMock),
    );
  });

  it("should create a media record with sortOrder 0 when no existing media", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findFirst.mockResolvedValue(null);
    prismaMock.media.create.mockResolvedValue(mediaBase);

    const result = await useCase.execute("ws-1", "user-1", {
      key: "websites/ws-1/photo.jpg",
      fileName: "photo.jpg",
      sizeBytes: 1024,
      mimeType: "image/jpeg",
    });

    expect(result.type).toBe("PHOTO");
    expect(result.sortOrder).toBe(0);
    expect(prismaMock.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sortOrder: 0 }),
      }),
    );
  });

  it("should increment sortOrder when lastMedia exists", async () => {
    const lastMedia = { ...mediaBase, sortOrder: 4 };
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findFirst.mockResolvedValue(lastMedia);
    prismaMock.media.create.mockResolvedValue({ ...mediaBase, sortOrder: 5 });

    await useCase.execute("ws-1", "user-1", {
      key: "websites/ws-1/photo.jpg",
      fileName: "photo.jpg",
      sizeBytes: 1024,
      mimeType: "image/jpeg",
    });

    expect(prismaMock.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sortOrder: 5 }),
      }),
    );
  });

  it("should create a VIDEO record for a valid video upload", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);
    prismaMock.media.findFirst.mockResolvedValue(null);
    prismaMock.media.create.mockResolvedValue({
      ...mediaBase,
      type: "VIDEO",
      mimeType: "video/mp4",
    });

    const result = await useCase.execute("ws-1", "user-1", {
      key: "websites/ws-1/video.mp4",
      fileName: "video.mp4",
      sizeBytes: 1024,
      mimeType: "video/mp4",
    });

    expect(result.type).toBe("VIDEO");
  });

  it("should throw NotFoundError when website does not exist", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("ws-1", "user-1", {
        key: "k",
        fileName: "f",
        sizeBytes: 1,
        mimeType: "image/jpeg",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError when user does not own the website", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "other-user", {
        key: "k",
        fileName: "f",
        sizeBytes: 1,
        mimeType: "image/jpeg",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("should throw BadRequestError when file type is unsupported", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "user-1", {
        key: "k",
        fileName: "f.pdf",
        sizeBytes: 1,
        mimeType: "application/pdf",
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError when photo exceeds size limit", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "user-1", {
        key: "k",
        fileName: "big.jpg",
        sizeBytes: 20 * 1024 * 1024,
        mimeType: "image/jpeg",
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError when video exceeds size limit", async () => {
    prismaMock.coupleWebsite.findUnique.mockResolvedValue(website);

    await expect(
      useCase.execute("ws-1", "user-1", {
        key: "k",
        fileName: "big.mp4",
        sizeBytes: 200 * 1024 * 1024,
        mimeType: "video/mp4",
      }),
    ).rejects.toThrow(BadRequestError);
  });
});
