import { z } from "zod";
import { ShipmentStatus } from "@/interfaces/shipment";
import { cityCoordinates } from "@/utils/map-helper";

export const CreateShipmentSchema = z.object({
  origin: z.enum(Object.keys(cityCoordinates) as [string], {
    errorMap: () => ({
      message: `Must be one of the valid cities: ${Object.keys(cityCoordinates).join(", ")}`,
    }),
  }),
  destination: z.enum(Object.keys(cityCoordinates) as [string], {
    errorMap: () => ({
      message: `Must be one of the valid cities: ${Object.keys(cityCoordinates).join(", ")}`,
    }),
  }),
});

/**
 * DTO for inserting a new shipment.
 */
export type CreateShipmentDTO = z.infer<typeof CreateShipmentSchema>;

/**
 * Valid statuses for update operations.
 */
const updatableStatuses = [
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.DELIVERED,
  ShipmentStatus.CANCELLED,
] as const;

export const UpdateStatusSchema = z.object({
  status: z.enum(updatableStatuses, {
    errorMap: () => ({
      message: "Status must be one of: IN_TRANSIT, DELIVERED, CANCELLED",
    }),
  }),
});

/**
 * DTO for updating a shipment's status.
 */
export type UpdateStatusDTO = z.infer<typeof UpdateStatusSchema>;
