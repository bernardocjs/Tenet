import { PrismaClient, ShipmentStatus, type Shipment } from "@prisma/client";
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
  constructor(private readonly prisma: PrismaClient) {}

  async execute(id: string, status: ShipmentStatus): Promise<Shipment> {
    const existing = await this.prisma.shipment.findUnique({ where: { id } });

    if (!existing)
      throw new NotFoundError(`Shipment with id '${id}' not found`);

    const validStatusTransitions = VALID_TRANSITIONS[existing.status];

    if (!validStatusTransitions.includes(status))
      throw new BadRequestError(
        `Invalid status transition from '${existing.status}' to '${status}'`,
      );

    return this.prisma.shipment.update({
      where: { id },
      data: { status },
    });
  }
}
