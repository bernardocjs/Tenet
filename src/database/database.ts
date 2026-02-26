import { Shipment, ShipmentStatus } from "@/interfaces/shipment";
import { ShipmentDatabaseRepository } from "@/database/interface";

export class InMemoryShipmentDatabase implements ShipmentDatabaseRepository {
  private readonly shipments: Map<string, Shipment> = new Map();

  async save(shipment: Shipment): Promise<void> {
    this.shipments.set(shipment.id, { ...shipment });
  }

  async findById(id: string): Promise<Shipment | null> {
    const shipment = this.shipments.get(id);
    return shipment ? { ...shipment } : null;
  }

  async updateStatus(
    id: string,
    status: ShipmentStatus,
  ): Promise<Shipment | null> {
    const shipment = this.shipments.get(id);
    if (!shipment) return null;

    shipment.status = status;
    shipment.updatedAt = new Date();
    return { ...shipment };
  }
}
