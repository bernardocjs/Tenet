import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient, ShipmentStatus, type Shipment } from "@prisma/client";
import { GetShipmentByIdUseCase } from "@/usecases/get-shipment-by-id";
import { NotFoundError } from "@/errors";

const mockShipment: Shipment = {
  id: "abc-123",
  origin: "São Paulo",
  destination: "Curitiba",
  status: ShipmentStatus.PENDING,
  distanceKm: 400,
  estimatedDeliveryHours: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GetShipmentByIdUseCase", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let useCase: GetShipmentByIdUseCase;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    useCase = new GetShipmentByIdUseCase(prisma);
  });

  it("should return the shipment when found", async () => {
    prisma.shipment.findUnique.mockResolvedValue(mockShipment);

    const result = await useCase.execute("abc-123");

    expect(result).toEqual(mockShipment);
  });

  it("should throw NotFoundError when shipment does not exist", async () => {
    prisma.shipment.findUnique.mockResolvedValue(null);

    await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Shipment with id 'nonexistent' not found",
    );
  });
});
