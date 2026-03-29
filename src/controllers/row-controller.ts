import { Request, Response } from "express";
import { CreateRowDto, RenameRowDto, RowIdParam } from "@/dtos/row-dtos";
import { WebsiteIdParam } from "@/dtos/website-dtos";
import { CreateRowUseCase } from "@/usecases/rows/create-row";
import { RenameRowUseCase } from "@/usecases/rows/rename-row";
import { DeleteRowUseCase } from "@/usecases/rows/delete-row";
import { ListRowsUseCase } from "@/usecases/rows/list-rows";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/utils/request-helpers";

export async function createRow(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const input = CreateRowDto.parse(req.body);
  const useCase = new CreateRowUseCase(prisma);
  const row = await useCase.execute(id, requireUserId(req), input);
  res.status(201).json(row);
}

export async function renameRow(req: Request, res: Response): Promise<void> {
  const { id, rowId } = RowIdParam.parse(req.params);
  const input = RenameRowDto.parse(req.body);
  const useCase = new RenameRowUseCase(prisma);
  const row = await useCase.execute(id, requireUserId(req), rowId, input);
  res.status(200).json(row);
}

export async function deleteRow(req: Request, res: Response): Promise<void> {
  const { id, rowId } = RowIdParam.parse(req.params);
  const useCase = new DeleteRowUseCase(prisma);
  await useCase.execute(id, requireUserId(req), rowId);
  res.status(204).send();
}

export async function listRows(req: Request, res: Response): Promise<void> {
  const { id } = WebsiteIdParam.parse(req.params);
  const useCase = new ListRowsUseCase(prisma);
  const rows = await useCase.execute(id, requireUserId(req));
  res.status(200).json(rows);
}
