import { Shipment, ShipmentStatus } from "@/interfaces/shipment";
import { ShipmentDatabaseRepository } from "@/database/interface";
import { NotFoundError, BadRequestError } from "@/errors";

const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.PENDING]: [
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.CANCELLED,
  ],
  [ShipmentStatus.IN_TRANSIT]: [
    ShipmentStatus.DELIVERED,
    ShipmentStatus.CANCELLED,
  ],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.CANCELLED]: [],
};

/**
 * Updates the status of an existing shipment following allowed transitions.
 * Valid transitions: PENDING -> IN_TRANSIT | CANCELLED, IN_TRANSIT -> DELIVERED | CANCELLED.
 * @param id - Shipment ID to update
 * @param status - New status to apply
 * @returns The updated shipment entity
 */
export class UpdateShipmentStatusUseCase {
  constructor(private readonly shipmentDatabase: ShipmentDatabaseRepository) {}

  async execute(id: string, status: ShipmentStatus): Promise<Shipment> {
    const existing = await this.shipmentDatabase.findById(id);

    if (!existing)
      throw new NotFoundError(`Shipment with id '${id}' not found`);

    const validStatusTransitions = VALID_TRANSITIONS[existing.status];

    if (!validStatusTransitions.includes(status))
      throw new BadRequestError(
        `Invalid status transition from '${existing.status}' to '${status}'`,
      );

    const updated = await this.shipmentDatabase.updateStatus(id, status);

    if (!updated)
      throw new NotFoundError(
        `Shipment with id '${id}' was not found during update`,
      );

    return updated;
  }
}
