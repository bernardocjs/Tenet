import crypto from "node:crypto";
import { PrismaClient, ShipmentStatus, type Shipment } from "@prisma/client";
import { CreateShipmentDTO } from "@/dtos/shipment-dtos";
import { MapRepository } from "@/providers/map/interface";
import { config } from "@/config";

export class CreateShipmentUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapService: MapRepository,
  ) {}

  /**
   * Creates a new shipment with estimated delivery hours and cost.
   * @param data - Shipment information payload
   * @returns The newly created shipment object
   */
  async execute(data: CreateShipmentDTO): Promise<Shipment> {
    const distanceKm = parseFloat(
      (
        await this.mapService.getDistanceKm(data.origin, data.destination)
      ).toFixed(2),
    );

    const estimatedDeliveryHours: number = parseFloat(
      (distanceKm / config.averageSpeedKmh).toFixed(2),
    );

    return this.prisma.shipment.create({
      data: {
        id: crypto.randomUUID(),
        origin: data.origin,
        destination: data.destination,
        status: ShipmentStatus.PENDING,
        distanceKm,
        estimatedDeliveryHours,
      },
    });
  }
}
