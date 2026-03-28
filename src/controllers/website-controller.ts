import { Request, Response } from "express";
import { CreateWebsiteDto, UpdateWebsiteDto, WebsiteIdParam, ListWebsitesQueryDto } from "@/dtos/website-dtos";
import { CreateWebsiteUseCase } from "@/usecases/websites/create-website";
import { ListUserWebsitesUseCase } from "@/usecases/websites/list-user-websites";
import { GetWebsiteByIdUseCase } from "@/usecases/websites/get-website-by-id";
import { UpdateWebsiteUseCase } from "@/usecases/websites/update-website";
import { DeleteWebsiteUseCase } from "@/usecases/websites/delete-website";
import { PublishWebsiteUseCase } from "@/usecases/websites/publish-website";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/utils/request-helpers";

export async function createWebsite(req: Request, res: Response): Promise<void> {
  const input = CreateWebsiteDto.parse(req.body);
  const useCase = new CreateWebsiteUseCase(prisma);
  const website = await useCase.execute(requireUserId(req), input);
  res.status(201).json(website);
}

export async function listWebsites(req: Request, res: Response): Promise<void> {
  const { page, limit } = ListWebsitesQueryDto.parse(req.query);
  const useCase = new ListUserWebsitesUseCase(prisma);
  const result = await useCase.execute(requireUserId(req), page, limit);
  res.status(200).json(result);
}

export async function getWebsite(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const useCase = new GetWebsiteByIdUseCase(prisma);
  const website = await useCase.execute(id, requireUserId(req));
  res.status(200).json(website);
}

export async function updateWebsite(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const input = UpdateWebsiteDto.parse(req.body);
  const useCase = new UpdateWebsiteUseCase(prisma);
  const website = await useCase.execute(id, requireUserId(req), input);
  res.status(200).json(website);
}

export async function deleteWebsite(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const useCase = new DeleteWebsiteUseCase(prisma);
  await useCase.execute(id, requireUserId(req));
  res.status(204).send();
}

export async function publishWebsite(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const useCase = new PublishWebsiteUseCase(prisma);
  const website = await useCase.execute(id, requireUserId(req));
  res.status(200).json(website);
}
