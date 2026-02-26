import crypto from "node:crypto";
import { CreateShipmentDTO } from "@/dtos/shipment-dtos";
import { Shipment, ShipmentStatus } from "@/interfaces/shipment";
import { ShipmentDatabaseRepository } from "@/database/interface";
import { MapRepository } from "@/providers/map/interface";
import { config } from "@/config";

export class CreateShipmentUseCase {
  constructor(
    private readonly shipmentDatabase: ShipmentDatabaseRepository,
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

    const shipment: Shipment = {
      id: crypto.randomUUID(),
      origin: data.origin,
      destination: data.destination,
      status: ShipmentStatus.PENDING,
      distanceKm,
      estimatedDeliveryHours,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.shipmentDatabase.save(shipment);
    return shipment;
  }
}
