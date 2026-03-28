import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { BadRequestError } from "@/errors";
import { RegisterInput } from "@/dtos/auth-dtos";

interface RegisterResult {
  user: { id: string; email: string; name: string | null };
  token: string;
}

export class RegisterUserUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(input: RegisterInput): Promise<RegisterResult> {
    const existing = await this.db.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new BadRequestError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.db.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name ?? null,
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }
}
