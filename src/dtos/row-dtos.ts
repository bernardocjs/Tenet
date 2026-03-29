import { z } from "zod";

export const CreateRowDto = z.object({
  name: z.string().min(1).max(100),
});

export type CreateRowInput = z.infer<typeof CreateRowDto>;

export const RenameRowDto = z.object({
  name: z.string().min(1).max(100),
});

export type RenameRowInput = z.infer<typeof RenameRowDto>;

export const RowIdParam = z.object({
  id: z.string().uuid(),
  rowId: z.string().uuid(),
});
