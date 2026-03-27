import { PrismaClient, type Shipment } from "@prisma/client";
import { NotFoundError } from "@/errors";

export class GetShipmentByIdUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves a shipment by its id.
   * @param id - Shipment ID to look up
   * @returns The shipment information if found
   */
  async execute(id: string): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findUnique({ where: { id } });

    if (!shipment)
      throw new NotFoundError(`Shipment with id '${id}' not found`);

    return shipment;
  }
}
