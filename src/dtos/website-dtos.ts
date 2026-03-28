import { z } from "zod";

export const CreateWebsiteDto = z.object({
  title: z.string().min(1).max(200),
  partnerName1: z.string().min(1).max(100),
  partnerName2: z.string().min(1).max(100),
  anniversaryDate: z.coerce.date().optional(),
  message: z.string().max(5000).optional(),
  theme: z.string().min(1).max(50).default("classic"),
});

export type CreateWebsiteInput = z.infer<typeof CreateWebsiteDto>;

export const UpdateWebsiteDto = z.object({
  title: z.string().min(1).max(200).optional(),
  partnerName1: z.string().min(1).max(100).optional(),
  partnerName2: z.string().min(1).max(100).optional(),
  anniversaryDate: z.coerce.date().nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
  theme: z.string().min(1).max(50).optional(),
});

export type UpdateWebsiteInput = z.infer<typeof UpdateWebsiteDto>;

export const WebsiteIdParam = z.object({
  id: z.string().uuid(),
});

export const PublicParamsDto = z.object({
  slug: z.string().min(1),
});

export type PublicParamsInput = z.infer<typeof PublicParamsDto>;
