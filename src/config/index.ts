import { logger } from "@/utils/logger";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

if (!process.env.CORS_ORIGIN) {
  logger.warn("CORS_ORIGIN not set, allowing all origins — set this in production");
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  // Cloudflare R2
  r2AccountId: requireEnv("R2_ACCOUNT_ID"),
  r2AccessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
  r2SecretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  r2BucketName: requireEnv("R2_BUCKET_NAME"),
  r2PublicUrl: process.env.R2_PUBLIC_URL ?? "",

  // App
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  maxPhotoSizeBytes: 10 * 1024 * 1024,
  maxVideoSizeBytes: 100 * 1024 * 1024,
};
