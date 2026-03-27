import { Request, Response } from "express";
import { RegisterDto, LoginDto } from "@/dtos/auth-dtos";
import { RegisterUserUseCase } from "@/usecases/auth/register-user";
import { LoginUserUseCase } from "@/usecases/auth/login-user";
import { prisma } from "@/lib/prisma";

export async function register(req: Request, res: Response): Promise<void> {
  const input = RegisterDto.parse(req.body);
  const useCase = new RegisterUserUseCase(prisma);
  const result = await useCase.execute(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = LoginDto.parse(req.body);
  const useCase = new LoginUserUseCase(prisma);
  const result = await useCase.execute(input);
  res.status(200).json(result);
}
