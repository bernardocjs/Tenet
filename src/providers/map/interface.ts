export interface MapRepository {
  /**
   * Calculates driving distance between two cities.
   * @param origin - Origin city name
   * @param destination - Destination city name
   * @returns Distance in kilometers
   */
  getDistanceKm(origin: string, destination: string): Promise<number>;
}
