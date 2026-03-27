import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { ExternalServiceError } from "@/errors";
import { StorageProvider, PresignedUrlResult } from "./interface";

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
      throw new ExternalServiceError("Failed to generate upload URL");
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.r2BucketName,
        Key: key,
      });
      await this.client.send(command);
    } catch (err) {
      if (err instanceof ExternalServiceError) throw err;
      throw new ExternalServiceError("Failed to delete object from storage");
    }
  }
}
