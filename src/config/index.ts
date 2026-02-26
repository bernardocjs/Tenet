export const config = {
  port: Number(process.env.PORT) || 3000,
  osrmBaseUrl:
    process.env.OSRM_URL || "https://router.project-osrm.org/route/v1/driving",
  averageSpeedKmh: 80,
} as const;
