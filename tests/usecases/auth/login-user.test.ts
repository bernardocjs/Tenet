import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { LoginUserUseCase } from "@/usecases/auth/login-user";
import { UnauthorizedError } from "@/errors";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn().mockImplementation((plain: string) =>
      Promise.resolve(plain === "correct-password"),
    ),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn().mockReturnValue("mock-jwt-token") },
}));

describe("LoginUserUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: LoginUserUseCase;

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    passwordHash: "hashed",
    name: "Test",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new LoginUserUseCase(prismaMock);
  });

  it("should return user and token on valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await useCase.execute({
      email: "test@example.com",
      password: "correct-password",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.token).toBe("mock-jwt-token");
  });

  it("should throw UnauthorizedError when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: "noone@example.com", password: "pass" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError when password is wrong", async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      useCase.execute({ email: "test@example.com", password: "wrong" }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
