import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { ExternalServiceError } from "@/errors";
import { logger } from "@/utils/logger";
import { StorageProvider, PresignedUrlResult } from "./interface";

const REQUEST_TIMEOUT_MS = 5000;

export class R2StorageProvider implements StorageProvider {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey,
      },
    });
  }

  /**
   * Generates a presigned upload URL for a file.
   * @param fileName - The original file name
   * @param contentType - The MIME type of the file
   * @param websiteId - The ID of the website the file belongs to
   * @returns An object containing the presigned upload URL, the storage key, and the public URL
   * @throws ExternalServiceError if the presigned URL cannot be generated
   */
  async generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    websiteId: string,
  ): Promise<PresignedUrlResult> {
    const timestamp = Date.now();
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `websites/${websiteId}/${timestamp}-${sanitized}`;

    try {
      const command = new PutObjectCommand({
        Bucket: config.r2BucketName,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: 900,
      });

      const publicUrl = `${config.r2PublicUrl}/${key}`;

      return { uploadUrl, key, publicUrl };
    } catch (err) {
      if (err instanceof ExternalServiceError) throw err;
      logger.error({ err }, "R2 operation failed");
      throw new ExternalServiceError("Failed to generate upload URL");
    }
  }

  /**
   * Deletes an object from R2 storage by its key.
   * @param key - The storage key of the object to delete
   * @throws ExternalServiceError if the deletion fails
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.r2BucketName,
        Key: key,
      });
      await this.client.send(command, {
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof ExternalServiceError) throw err;
      logger.error({ err }, "R2 operation failed");
      throw new ExternalServiceError("Failed to delete object from storage");
    }
  }
}
