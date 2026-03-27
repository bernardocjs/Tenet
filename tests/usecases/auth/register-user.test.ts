import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { RegisterUserUseCase } from "@/usecases/auth/register-user";
import { BadRequestError } from "@/errors";

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed-password") },
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn().mockReturnValue("mock-jwt-token") },
}));

describe("RegisterUserUseCase", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    mockReset(prismaMock);
    useCase = new RegisterUserUseCase(prismaMock);
  });

  it("should create a user and return token", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hashed-password",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await useCase.execute({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.user.name).toBe("Test User");
    expect(result.token).toBe("mock-jwt-token");
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
      },
    });
  });

  it("should throw BadRequestError when email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hashed",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await expect(
      useCase.execute({
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(BadRequestError);
  });
});
