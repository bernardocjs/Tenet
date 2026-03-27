import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient, ShipmentStatus, type Shipment } from "@prisma/client";
import { UpdateShipmentStatusUseCase } from "@/usecases/update-shipment-status";
import { NotFoundError, BadRequestError } from "@/errors";

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: "abc-123",
    origin: "São Paulo",
    destination: "Curitiba",
    status: ShipmentStatus.PENDING,
    distanceKm: 400,
    estimatedDeliveryHours: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("UpdateShipmentStatusUseCase", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let useCase: UpdateShipmentStatusUseCase;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    useCase = new UpdateShipmentStatusUseCase(prisma);
  });

  it("should update PENDING to IN_TRANSIT", async () => {
    const existing = makeShipment({ status: ShipmentStatus.PENDING });
    const updated = makeShipment({ status: ShipmentStatus.IN_TRANSIT });
    prisma.shipment.findUnique.mockResolvedValue(existing);
    prisma.shipment.update.mockResolvedValue(updated);

    const result = await useCase.execute("abc-123", ShipmentStatus.IN_TRANSIT);

    expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
  });

  it("should update PENDING to CANCELLED", async () => {
    const existing = makeShipment({ status: ShipmentStatus.PENDING });
    const updated = makeShipment({ status: ShipmentStatus.CANCELLED });
    prisma.shipment.findUnique.mockResolvedValue(existing);
    prisma.shipment.update.mockResolvedValue(updated);

    const result = await useCase.execute("abc-123", ShipmentStatus.CANCELLED);

    expect(result.status).toBe(ShipmentStatus.CANCELLED);
  });

  it("should update IN_TRANSIT to DELIVERED", async () => {
    const existing = makeShipment({ status: ShipmentStatus.IN_TRANSIT });
    const updated = makeShipment({ status: ShipmentStatus.DELIVERED });
    prisma.shipment.findUnique.mockResolvedValue(existing);
    prisma.shipment.update.mockResolvedValue(updated);

    const result = await useCase.execute("abc-123", ShipmentStatus.DELIVERED);

    expect(result.status).toBe(ShipmentStatus.DELIVERED);
  });

  it("should throw NotFoundError when shipment does not exist", async () => {
    prisma.shipment.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute("nonexistent", ShipmentStatus.IN_TRANSIT),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw BadRequestError for invalid transition PENDING -> DELIVERED", async () => {
    prisma.shipment.findUnique.mockResolvedValue(
      makeShipment({ status: ShipmentStatus.PENDING }),
    );

    await expect(
      useCase.execute("abc-123", ShipmentStatus.DELIVERED),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError for invalid transition DELIVERED -> anything", async () => {
    prisma.shipment.findUnique.mockResolvedValue(
      makeShipment({ status: ShipmentStatus.DELIVERED }),
    );

    await expect(
      useCase.execute("abc-123", ShipmentStatus.IN_TRANSIT),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError for invalid transition CANCELLED -> anything", async () => {
    prisma.shipment.findUnique.mockResolvedValue(
      makeShipment({ status: ShipmentStatus.CANCELLED }),
    );

    await expect(
      useCase.execute("abc-123", ShipmentStatus.PENDING),
    ).rejects.toThrow(BadRequestError);
  });
});
