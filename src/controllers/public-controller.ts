import { Request, Response } from "express";
import { PublicParamsDto } from "@/dtos/website-dtos";
import { GetPublicWebsiteUseCase } from "@/usecases/public/get-public-website";
import { prisma } from "@/lib/prisma";

export async function getPublicWebsite(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = PublicParamsDto.parse(req.params);
  const useCase = new GetPublicWebsiteUseCase(prisma);
  const website = await useCase.execute(slug);
  res.status(200).json(website);
}
