import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateShipmentUseCase } from "@/usecases/create-shipment";
import { MapRepository } from "@/providers/map/interface";
import { ShipmentStatus } from "@/interfaces/shipment";
import { InMemoryShipmentDatabase } from "@/database/database";
import { ShipmentDatabaseRepository } from "@/database/interface";

describe("CreateShipmentUseCase", () => {
  let shipmentDatabase: ShipmentDatabaseRepository;
  let mapService: MapRepository;
  let useCase: CreateShipmentUseCase;

  beforeEach(() => {
    shipmentDatabase = new InMemoryShipmentDatabase();

    mapService = {
      getDistanceKm: vi.fn().mockResolvedValue(400),
    };

    useCase = new CreateShipmentUseCase(shipmentDatabase, mapService);
  });

  it("should create a shipment with correct fields", async () => {
    const input = {
      origin: "São Paulo",
      destination: "Rio de Janeiro",
    };
    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(result.origin).toBe("São Paulo");
    expect(result.destination).toBe("Rio de Janeiro");
    expect(result.status).toBe(ShipmentStatus.PENDING);
    expect(result.distanceKm).toBe(400);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should calculate estimatedDeliveryHours from distance and speed", async () => {
    const result = await useCase.execute({
      origin: "A",
      destination: "B",
    });

    // 400km / 80km/h = 5 hours
    expect(result.estimatedDeliveryHours).toBe(5);
  });

  it("should call mapService.getDistanceKm with origin and destination", async () => {
    await useCase.execute({ origin: "A", destination: "B" });

    expect(mapService.getDistanceKm).toHaveBeenCalledWith("A", "B");
  });

  it("should persist the shipment in the repository", async () => {
    const result = await useCase.execute({
      origin: "A",
      destination: "B",
    });

    const persisted = await shipmentDatabase.findById(result.id);
    expect(persisted).toEqual(result);
  });
});
