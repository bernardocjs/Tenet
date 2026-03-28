import { createApp } from "@/app";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { prisma } from "@/lib/prisma";

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down");
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore disconnect errors during shutdown
    }
    process.exit(0);
  });
});
