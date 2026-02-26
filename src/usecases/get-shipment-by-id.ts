import { Shipment } from "@/interfaces/shipment";
import { ShipmentDatabaseRepository } from "@/database/interface";
import { NotFoundError } from "@/errors";

export class GetShipmentByIdUseCase {
  constructor(private readonly shipmentDatabase: ShipmentDatabaseRepository) {}

  /**
   * Retrieves a shipment by its id.
   * @param id - Shipment ID to look up
   * @returns The shipment information if found
   */
  async execute(id: string): Promise<Shipment> {
    const shipment = await this.shipmentDatabase.findById(id);

    if (!shipment)
      throw new NotFoundError(`Shipment with id '${id}' not found`);

    return shipment;
  }
}
