import { Request, Response } from "express";
import { CreateShipmentUseCase } from "@/usecases/create-shipment";
import { GetShipmentByIdUseCase } from "@/usecases/get-shipment-by-id";
import { UpdateShipmentStatusUseCase } from "@/usecases/update-shipment-status";
import { CreateShipmentSchema, UpdateStatusSchema } from "@/dtos/shipment-dtos";
import { InMemoryShipmentDatabase } from "@/database/database";
import { OsrmMapProvider } from "@/providers/map/osrm-map-provider";

export const shipmentDatabaseService = new InMemoryShipmentDatabase();
export const mapService = new OsrmMapProvider();

export async function createShipment(
  req: Request,
  res: Response,
): Promise<void> {
  const data = CreateShipmentSchema.parse(req.body);
  const useCase = new CreateShipmentUseCase(
    shipmentDatabaseService,
    mapService,
  );
  const shipment = await useCase.execute(data);
  res.status(201).json(shipment);
}

export async function getShipmentById(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const useCase = new GetShipmentByIdUseCase(shipmentDatabaseService);
  const shipment = await useCase.execute(id);
  res.json(shipment);
}

export async function updateShipmentStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const { status } = UpdateStatusSchema.parse(req.body);
  const useCase = new UpdateShipmentStatusUseCase(shipmentDatabaseService);
  const shipment = await useCase.execute(id, status);
  res.json(shipment);
}
