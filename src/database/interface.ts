import { Shipment, ShipmentStatus } from "../interfaces/shipment";

export interface ShipmentDatabaseRepository {
  /**
   * Persists a new shipment.
   * @param shipment - Shipment entity to store
   */
  save(shipment: Shipment): Promise<void>;

  /**
   * Retrieves a shipment by its unique identifier.
   * @param id - Shipment ID
   * @returns The shipment if found, null otherwise
   */
  findById(id: string): Promise<Shipment | null>;

  /**
   * Updates the status of an existing shipment.
   * @param id - Shipment ID
   * @param status - New status value
   * @returns The updated shipment if found, null otherwise
   */
  updateStatus(id: string, status: ShipmentStatus): Promise<Shipment | null>;
}
