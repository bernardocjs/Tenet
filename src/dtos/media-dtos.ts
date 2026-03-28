import { z } from "zod";

export const UploadUrlDto = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^(image|video)\/.+$/),
});

export type UploadUrlInput = z.infer<typeof UploadUrlDto>;

export const ConfirmUploadDto = z.object({
  key: z.string().min(1),
  fileName: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  mimeType: z.string().regex(/^(image|video)\/.+$/),
  caption: z.string().max(500).optional(),
});

export type ConfirmUploadInput = z.infer<typeof ConfirmUploadDto>;

export const ReorderMediaDto = z.object({
  mediaIds: z.array(z.string().uuid()).min(1),
});

export type ReorderMediaInput = z.infer<typeof ReorderMediaDto>;

export const MediaIdParam = z.object({
  id: z.string().uuid(),
  mediaId: z.string().uuid(),
});

export const ListMediaQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListMediaQueryInput = z.infer<typeof ListMediaQueryDto>;
