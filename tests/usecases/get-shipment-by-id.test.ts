import { describe, it, expect, beforeEach } from "vitest";
import { GetShipmentByIdUseCase } from "@/usecases/get-shipment-by-id";
import { InMemoryShipmentDatabase } from "@/database/database";
import { Shipment, ShipmentStatus } from "@/interfaces/shipment";
import { NotFoundError } from "@/errors";
import { ShipmentDatabaseRepository } from "@/database/interface";

const mockShipment: Shipment = {
  id: "abc-123",
  origin: "São Paulo",
  destination: "Curitiba",
  status: ShipmentStatus.PENDING,
  distanceKm: 400,
  estimatedDeliveryHours: 5,
  createdAt: new Date(),
};

describe("GetShipmentByIdUseCase", () => {
  let shipmentDatabase: ShipmentDatabaseRepository;
  let useCase: GetShipmentByIdUseCase;

  beforeEach(() => {
    shipmentDatabase = new InMemoryShipmentDatabase();
    useCase = new GetShipmentByIdUseCase(shipmentDatabase);
  });

  it("should return the shipment when found", async () => {
    await shipmentDatabase.save(mockShipment);

    const result = await useCase.execute("abc-123");

    expect(result).toEqual(mockShipment);
  });

  it("should throw NotFoundError when shipment does not exist", async () => {
    await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundError);
    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Shipment with id 'nonexistent' not found",
    );
  });
});
