import { MapRepository } from "@/providers/map/interface";
import { BadRequestError, ExternalServiceError } from "@/errors";
import { cityCoordinates } from "@/utils/map-helper";
import { logger } from "@/utils/logger";
import { config } from "@/config";

interface OsrmRouteResponse {
  code: string;
  routes: Array<{ distance: number; duration: number }>;
}

export class OsrmMapProvider implements MapRepository {
  private readonly baseUrl = config.osrmBaseUrl;

  /**
   * Calculates driving distance between two cities via OSRM API.
   * @param origin - Origin city name (must exist in cityCoordinates)
   * @param destination - Destination city name (must exist in cityCoordinates)
   * @returns Distance in kilometers
   */
  async getDistanceKm(origin: string, destination: string): Promise<number> {
    const originCoords = cityCoordinates[origin];
    const destCoords = cityCoordinates[destination];

    if (!originCoords || !destCoords)
      throw new BadRequestError(
        `origin and destination must be valid cities: ${Object.keys(cityCoordinates).join(", ")}`,
      );

    logger.info({ origin, destination }, "Requesting OSRM route");

    const url = `${this.baseUrl}/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}`;
    const response = await fetch(url);

    if (!response.ok)
      throw new ExternalServiceError(`Error communicating with map service`);

    const data = (await response.json()) as OsrmRouteResponse;
    if (data.code !== "Ok" || !data.routes.length)
      throw new ExternalServiceError(
        `OSRM could not calculate route: ${data.code}`,
      );

    const distanceKm = data.routes[0].distance / 1000;

    logger.info(
      { origin, destination, distanceKm: distanceKm.toFixed(2) },
      "Route calculated",
    );

    return distanceKm;
  }
}
