import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient, ShipmentStatus } from "@prisma/client";
import { CreateShipmentUseCase } from "@/usecases/create-shipment";
import { MapRepository } from "@/providers/map/interface";

describe("CreateShipmentUseCase", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let mapService: MapRepository;
  let useCase: CreateShipmentUseCase;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();

    mapService = {
      getDistanceKm: vi.fn().mockResolvedValue(400),
    };

    useCase = new CreateShipmentUseCase(prisma, mapService);
  });

  it("should create a shipment with correct fields", async () => {
    const now = new Date();
    prisma.shipment.create.mockResolvedValue({
      id: "some-uuid",
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      status: ShipmentStatus.PENDING,
      distanceKm: 400,
      estimatedDeliveryHours: 5,
      createdAt: now,
      updatedAt: now,
    });

    const result = await useCase.execute({
      origin: "São Paulo",
      destination: "Rio de Janeiro",
    });

    expect(result.id).toBeDefined();
    expect(result.origin).toBe("São Paulo");
    expect(result.destination).toBe("Rio de Janeiro");
    expect(result.status).toBe(ShipmentStatus.PENDING);
    expect(result.distanceKm).toBe(400);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should calculate estimatedDeliveryHours from distance and speed", async () => {
    const now = new Date();
    prisma.shipment.create.mockResolvedValue({
      id: "some-uuid",
      origin: "A",
      destination: "B",
      status: ShipmentStatus.PENDING,
      distanceKm: 400,
      estimatedDeliveryHours: 5,
      createdAt: now,
      updatedAt: now,
    });

    const result = await useCase.execute({ origin: "A", destination: "B" });

    // 400km / 80km/h = 5 hours
    expect(result.estimatedDeliveryHours).toBe(5);
  });

  it("should call mapService.getDistanceKm with origin and destination", async () => {
    const now = new Date();
    prisma.shipment.create.mockResolvedValue({
      id: "some-uuid",
      origin: "A",
      destination: "B",
      status: ShipmentStatus.PENDING,
      distanceKm: 400,
      estimatedDeliveryHours: 5,
      createdAt: now,
      updatedAt: now,
    });

    await useCase.execute({ origin: "A", destination: "B" });

    expect(mapService.getDistanceKm).toHaveBeenCalledWith("A", "B");
  });

  it("should persist the shipment in the repository", async () => {
    const now = new Date();
    prisma.shipment.create.mockResolvedValue({
      id: "some-uuid",
      origin: "A",
      destination: "B",
      status: ShipmentStatus.PENDING,
      distanceKm: 400,
      estimatedDeliveryHours: 5,
      createdAt: now,
      updatedAt: now,
    });

    await useCase.execute({ origin: "A", destination: "B" });

    expect(prisma.shipment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        origin: "A",
        destination: "B",
        status: ShipmentStatus.PENDING,
        distanceKm: 400,
        estimatedDeliveryHours: 5,
      }),
    });
  });
});
