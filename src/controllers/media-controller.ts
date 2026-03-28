import { Request, Response } from "express";
import { UploadUrlDto, ConfirmUploadDto, ReorderMediaDto, MediaIdParam } from "@/dtos/media-dtos";
import { WebsiteIdParam } from "@/dtos/website-dtos";
import { GenerateUploadUrlUseCase } from "@/usecases/media/generate-upload-url";
import { ConfirmUploadUseCase } from "@/usecases/media/confirm-upload";
import { ListMediaUseCase } from "@/usecases/media/list-media";
import { ReorderMediaUseCase } from "@/usecases/media/reorder-media";
import { DeleteMediaUseCase } from "@/usecases/media/delete-media";
import { R2StorageProvider } from "@/providers/storage/r2-storage-provider";
import { UnauthorizedError } from "@/errors";
import { prisma } from "@/lib/prisma";

function requireUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}

export async function generateUploadUrl(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const input = UploadUrlDto.parse(req.body);
  const useCase = new GenerateUploadUrlUseCase(prisma, new R2StorageProvider());
  const result = await useCase.execute(id, requireUserId(req), input);
  res.status(200).json(result);
}

export async function confirmUpload(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const input = ConfirmUploadDto.parse(req.body);
  const useCase = new ConfirmUploadUseCase(prisma);
  const media = await useCase.execute(id, requireUserId(req), input);
  res.status(201).json(media);
}

export async function listMedia(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const useCase = new ListMediaUseCase(prisma);
  const media = await useCase.execute(id, requireUserId(req));
  res.status(200).json(media);
}

export async function reorderMedia(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const input = ReorderMediaDto.parse(req.body);
  const useCase = new ReorderMediaUseCase(prisma);
  const media = await useCase.execute(id, requireUserId(req), input);
  res.status(200).json(media);
}

export async function deleteMedia(req: Request, res: Response): Promise<void> {
  const { id, mediaId } = MediaIdParam.parse(req.params);
  const useCase = new DeleteMediaUseCase(prisma, new R2StorageProvider());
  await useCase.execute(id, mediaId, requireUserId(req));
  res.status(204).send();
}
