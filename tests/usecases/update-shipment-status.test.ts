import { describe, it, expect, beforeEach } from "vitest";
import { UpdateShipmentStatusUseCase } from "@/usecases/update-shipment-status";
import { InMemoryShipmentDatabase } from "@/database/database";
import { Shipment, ShipmentStatus } from "@/interfaces/shipment";
import { NotFoundError, BadRequestError } from "@/errors";
import { ShipmentDatabaseRepository } from "@/database/interface";

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: "abc-123",
    origin: "São Paulo",
    destination: "Curitiba",
    status: ShipmentStatus.PENDING,
    distanceKm: 400,
    estimatedDeliveryHours: 5,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("UpdateShipmentStatusUseCase", () => {
  let shipmentDatabase: ShipmentDatabaseRepository;
  let useCase: UpdateShipmentStatusUseCase;

  beforeEach(() => {
    shipmentDatabase = new InMemoryShipmentDatabase();
    useCase = new UpdateShipmentStatusUseCase(shipmentDatabase);
  });

  it("should update PENDING to IN_TRANSIT", async () => {
    await shipmentDatabase.save(
      makeShipment({ status: ShipmentStatus.PENDING }),
    );

    const result = await useCase.execute("abc-123", ShipmentStatus.IN_TRANSIT);

    expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
  });

  it("should update PENDING to CANCELLED", async () => {
    await shipmentDatabase.save(
      makeShipment({ status: ShipmentStatus.PENDING }),
    );

    const result = await useCase.execute("abc-123", ShipmentStatus.CANCELLED);

    expect(result.status).toBe(ShipmentStatus.CANCELLED);
  });

  it("should update IN_TRANSIT to DELIVERED", async () => {
    await shipmentDatabase.save(
      makeShipment({ status: ShipmentStatus.IN_TRANSIT }),
    );

    const result = await useCase.execute("abc-123", ShipmentStatus.DELIVERED);

    expect(result.status).toBe(ShipmentStatus.DELIVERED);
  });

  it("should throw NotFoundError when shipment does not exist", async () => {
    await expect(
      useCase.execute("nonexistent", ShipmentStatus.IN_TRANSIT),
    ).rejects.toThrow(NotFoundError);
  });

  it("should throw BadRequestError for invalid transition PENDING -> DELIVERED", async () => {
    await shipmentDatabase.save(
      makeShipment({ status: ShipmentStatus.PENDING }),
    );

    await expect(
      useCase.execute("abc-123", ShipmentStatus.DELIVERED),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError for invalid transition DELIVERED -> anything", async () => {
    await shipmentDatabase.save(
      makeShipment({ status: ShipmentStatus.DELIVERED }),
    );

    await expect(
      useCase.execute("abc-123", ShipmentStatus.IN_TRANSIT),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError for invalid transition CANCELLED -> anything", async () => {
    await shipmentDatabase.save(
      makeShipment({ status: ShipmentStatus.CANCELLED }),
    );

    await expect(
      useCase.execute("abc-123", ShipmentStatus.PENDING),
    ).rejects.toThrow(BadRequestError);
  });
});
