export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Cloudflare R2
  r2AccountId: process.env.R2_ACCOUNT_ID || "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  r2BucketName: process.env.R2_BUCKET_NAME || "",
  r2PublicUrl: process.env.R2_PUBLIC_URL || "",

  // App
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  maxPhotoSizeBytes: 10 * 1024 * 1024,
  maxVideoSizeBytes: 100 * 1024 * 1024,
};
