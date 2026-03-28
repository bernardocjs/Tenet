import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { UnauthorizedError } from "@/errors";
import { LoginInput } from "@/dtos/auth-dtos";

interface LoginResult {
  user: { id: string; email: string; name: string | null };
  token: string;
}

export class LoginUserUseCase {
  constructor(private readonly db: PrismaClient) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.db.user.findUnique({
      where: { email: input.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }
}
